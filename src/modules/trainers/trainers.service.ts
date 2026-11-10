import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { Trainer } from './entities/trainer.entity';

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(Trainer)
    private readonly trainersRepository: Repository<Trainer>,
  ) {}

  async create(dto: CreateTrainerDto): Promise<Trainer> {
    await this.ensureUnique(dto.email, dto.phoneNumber);
    const trainer = this.trainersRepository.create(dto);
    return this.trainersRepository.save(trainer);
  }

  findAll(): Promise<Trainer[]> {
    return this.trainersRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Trainer> {
    const trainer = await this.trainersRepository.findOne({ where: { id } });
    if (!trainer) {
      throw new NotFoundException(`Trainer dengan id ${id} tidak ditemukan`);
    }
    return trainer;
  }

  async update(id: number, dto: UpdateTrainerDto): Promise<Trainer> {
    const trainer = await this.findOne(id);
    await this.ensureUnique(dto.email, dto.phoneNumber, id);
    Object.assign(trainer, dto);
    return this.trainersRepository.save(trainer);
  }

  async remove(id: number): Promise<void> {
    const trainer = await this.findOne(id);
    // Trainer yang masih punya sesi latihan ditolak database (FK RESTRICT) -> 409
    await this.trainersRepository.remove(trainer);
  }

  private async ensureUnique(
    email?: string,
    phoneNumber?: string,
    ignoreId?: number,
  ): Promise<void> {
    if (email) {
      const existing = await this.trainersRepository.findOne({
        where: { email },
      });
      if (existing && existing.id !== ignoreId) {
        throw new ConflictException(`Email ${email} sudah terdaftar`);
      }
    }
    if (phoneNumber) {
      const existing = await this.trainersRepository.findOne({
        where: { phoneNumber },
      });
      if (existing && existing.id !== ignoreId) {
        throw new ConflictException(`Nomor HP ${phoneNumber} sudah terdaftar`);
      }
    }
  }
}
