import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { toDateString } from '../../common/utils/date.util';
import { Member } from '../members/entities/member.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { TrainingSession } from '../training-sessions/entities/training-session.entity';
import { CreateSessionParticipantDto } from './dto/create-session-participant.dto';
import { QuerySessionParticipantDto } from './dto/query-session-participant.dto';
import { UpdateSessionParticipantDto } from './dto/update-session-participant.dto';
import { SessionParticipant } from './entities/session-participant.entity';

@Injectable()
export class SessionParticipantsService {
  constructor(
    @InjectRepository(SessionParticipant)
    private readonly participantsRepository: Repository<SessionParticipant>,
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
    @InjectRepository(TrainingSession)
    private readonly sessionsRepository: Repository<TrainingSession>,
    @InjectRepository(Membership)
    private readonly membershipsRepository: Repository<Membership>,
  ) {}

  /**
   * Mendaftarkan member ke sesi. Urutan pengecekan:
   *  1. Member & sesi harus ada                        -> 404
   *  2. Belum pernah terdaftar di sesi ini (Rule #8)   -> 409
   *  3. Sesi belum dimulai (R14)                       -> 400
   *  4. Punya membership aktif pada tanggal sesi (R13) -> 400
   *  5. Sesi belum penuh (Rule #9)                     -> 409
   */
  async create(dto: CreateSessionParticipantDto) {
    const member = await this.membersRepository.findOne({
      where: { id: dto.memberId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member dengan id ${dto.memberId} tidak ditemukan`,
      );
    }

    const session = await this.sessionsRepository.findOne({
      where: { id: dto.trainingSessionId },
    });
    if (!session) {
      throw new NotFoundException(
        `Training session dengan id ${dto.trainingSessionId} tidak ditemukan`,
      );
    }

    const alreadyRegistered = await this.participantsRepository.exists({
      where: { memberId: member.id, trainingSessionId: session.id },
    });
    if (alreadyRegistered) {
      throw new ConflictException(
        'Member sudah terdaftar pada training session ini',
      );
    }

    if (session.startTime.getTime() <= Date.now()) {
      throw new BadRequestException(
        'Training session sudah dimulai atau sudah lewat, pendaftaran ditutup',
      );
    }

    const sessionDate = toDateString(session.startTime);
    const hasActiveMembership = await this.membershipsRepository.exists({
      where: {
        memberId: member.id,
        startDate: LessThanOrEqual(sessionDate),
        endDate: MoreThanOrEqual(sessionDate),
      },
    });
    if (!hasActiveMembership) {
      throw new BadRequestException(
        'Member tidak memiliki membership aktif pada tanggal training session',
      );
    }

    const totalParticipants = await this.participantsRepository.count({
      where: { trainingSessionId: session.id },
    });
    if (totalParticipants >= session.capacity) {
      throw new ConflictException('Training session sudah penuh');
    }

    const participant = this.participantsRepository.create({
      memberId: member.id,
      trainingSessionId: session.id,
    });
    const saved = await this.participantsRepository.save(participant);
    return this.findOne(saved.id);
  }

  findAll(query: QuerySessionParticipantDto): Promise<SessionParticipant[]> {
    const where: FindOptionsWhere<SessionParticipant> = {};
    if (query.trainingSessionId !== undefined) {
      where.trainingSessionId = query.trainingSessionId;
    }
    if (query.memberId !== undefined) {
      where.memberId = query.memberId;
    }
    return this.participantsRepository.find({
      where,
      relations: { member: true, trainingSession: true },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<SessionParticipant> {
    const participant = await this.participantsRepository.findOne({
      where: { id },
      relations: { member: true, trainingSession: true },
    });
    if (!participant) {
      throw new NotFoundException(
        `Session participant dengan id ${id} tidak ditemukan`,
      );
    }
    return participant;
  }

  async update(id: number, dto: UpdateSessionParticipantDto) {
    const participant = await this.participantsRepository.findOne({
      where: { id },
    });
    if (!participant) {
      throw new NotFoundException(
        `Session participant dengan id ${id} tidak ditemukan`,
      );
    }
    participant.attendanceStatus = dto.attendanceStatus;
    await this.participantsRepository.save(participant);
    return this.findOne(id);
  }

  /** Membatalkan pendaftaran. */
  async remove(id: number): Promise<void> {
    const participant = await this.participantsRepository.findOne({
      where: { id },
    });
    if (!participant) {
      throw new NotFoundException(
        `Session participant dengan id ${id} tidak ditemukan`,
      );
    }
    await this.participantsRepository.remove(participant);
  }
}
