import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionParticipant } from '../session-participants/entities/session-participant.entity';
import { Trainer } from '../trainers/entities/trainer.entity';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import { TrainingSession } from './entities/training-session.entity';

@Injectable()
export class TrainingSessionsService {
  constructor(
    @InjectRepository(TrainingSession)
    private readonly sessionsRepository: Repository<TrainingSession>,
    @InjectRepository(Trainer)
    private readonly trainersRepository: Repository<Trainer>,
    @InjectRepository(SessionParticipant)
    private readonly participantsRepository: Repository<SessionParticipant>,
  ) {}

  async create(dto: CreateTrainingSessionDto) {
    await this.ensureTrainerExists(dto.trainerId);
    this.validateTimeRange(dto.startTime, dto.endTime);

    const session = this.sessionsRepository.create(dto);
    const saved = await this.sessionsRepository.save(session);
    return this.findOne(saved.id);
  }

  findAll(): Promise<TrainingSession[]> {
    return this.sessionsRepository.find({
      relations: { trainer: true },
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TrainingSession> {
    const session = await this.sessionsRepository.findOne({
      where: { id },
      relations: { trainer: true },
    });
    if (!session) {
      throw new NotFoundException(
        `Training session dengan id ${id} tidak ditemukan`,
      );
    }
    return session;
  }

  async update(id: number, dto: UpdateTrainingSessionDto) {
    // Dimuat tanpa relasi (lihat catatan di MembershipsService.update)
    const session = await this.findEntity(id);

    if (dto.trainerId !== undefined) {
      await this.ensureTrainerExists(dto.trainerId);
    }

    // Validasi jadwal memakai gabungan nilai baru dan nilai lama
    this.validateTimeRange(
      dto.startTime ?? session.startTime,
      dto.endTime ?? session.endTime,
    );

    // Business rule tambahan (R15): kapasitas tidak boleh lebih kecil dari
    // jumlah peserta yang sudah terdaftar.
    if (dto.capacity !== undefined) {
      const total = await this.participantsRepository.count({
        where: { trainingSessionId: id },
      });
      if (dto.capacity < total) {
        throw new ConflictException(
          `Kapasitas tidak boleh kurang dari jumlah peserta saat ini (${total})`,
        );
      }
    }

    Object.assign(session, dto);
    await this.sessionsRepository.save(session);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const session = await this.findEntity(id);
    // Sesi yang masih punya peserta ditolak database (FK RESTRICT) -> 409
    await this.sessionsRepository.remove(session);
  }

  /** Daftar peserta sebuah sesi beserta sisa kuota. */
  async findParticipants(id: number) {
    const session = await this.findEntity(id);
    const participants = await this.participantsRepository.find({
      where: { trainingSessionId: id },
      relations: { member: true },
      order: { id: 'ASC' },
    });
    return {
      sessionId: session.id,
      title: session.title,
      capacity: session.capacity,
      totalParticipants: participants.length,
      availableSlots: Math.max(session.capacity - participants.length, 0),
      participants,
    };
  }

  private async findEntity(id: number): Promise<TrainingSession> {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(
        `Training session dengan id ${id} tidak ditemukan`,
      );
    }
    return session;
  }

  private async ensureTrainerExists(trainerId: number): Promise<void> {
    const exists = await this.trainersRepository.exists({
      where: { id: trainerId },
    });
    if (!exists) {
      throw new NotFoundException(
        `Trainer dengan id ${trainerId} tidak ditemukan`,
      );
    }
  }

  /** Business Rule #6: jadwal harus valid (selesai setelah mulai). */
  private validateTimeRange(startTime: Date, endTime: Date): void {
    if (endTime.getTime() <= startTime.getTime()) {
      throw new BadRequestException('endTime harus setelah startTime');
    }
  }
}
