import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from '../memberships/entities/membership.entity';
import { withStatus } from '../memberships/membership-status';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './entities/member.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
    @InjectRepository(Membership)
    private readonly membershipsRepository: Repository<Membership>,
  ) {}

  async create(dto: CreateMemberDto): Promise<Member> {
    await this.ensureUnique(dto.email, dto.phoneNumber);
    const member = this.membersRepository.create(dto);
    return this.membersRepository.save(member);
  }

  findAll(): Promise<Member[]> {
    return this.membersRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.membersRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException(`Member dengan id ${id} tidak ditemukan`);
    }
    return member;
  }

  async update(id: number, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(id);
    await this.ensureUnique(dto.email, dto.phoneNumber, id);
    Object.assign(member, dto);
    return this.membersRepository.save(member);
  }

  async remove(id: number): Promise<void> {
    const member = await this.findOne(id);
    // Jika member masih punya membership / pendaftaran sesi, database menolak
    // (FK RESTRICT) dan TypeOrmExceptionFilter mengubahnya menjadi 409.
    await this.membersRepository.remove(member);
  }

  async findMemberships(id: number) {
    await this.findOne(id); // 404 jika member tidak ada
    const memberships = await this.membershipsRepository.find({
      where: { memberId: id },
      relations: { membershipPlan: true },
      order: { startDate: 'DESC' },
    });
    return memberships.map(withStatus);
  }

  /** Business Rule #1: email dan nomor HP tidak boleh dipakai member lain. */
  private async ensureUnique(
    email?: string,
    phoneNumber?: string,
    ignoreId?: number,
  ): Promise<void> {
    if (email) {
      const existing = await this.membersRepository.findOne({
        where: { email },
      });
      if (existing && existing.id !== ignoreId) {
        throw new ConflictException(`Email ${email} sudah terdaftar`);
      }
    }
    if (phoneNumber) {
      const existing = await this.membersRepository.findOne({
        where: { phoneNumber },
      });
      if (existing && existing.id !== ignoreId) {
        throw new ConflictException(`Nomor HP ${phoneNumber} sudah terdaftar`);
      }
    }
  }
}
