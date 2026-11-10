import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { addDays, todayString } from '../../common/utils/date.util';
import { Member } from '../members/entities/member.entity';
import { MembershipPlan } from '../membership-plans/entities/membership-plan.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { QueryMembershipDto } from './dto/query-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { Membership } from './entities/membership.entity';
import { MembershipStatus, withStatus } from './membership-status';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipsRepository: Repository<Membership>,
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
    @InjectRepository(MembershipPlan)
    private readonly plansRepository: Repository<MembershipPlan>,
  ) {}

  async create(dto: CreateMembershipDto) {
    // Business Rule #4: harus mengacu ke Member dan MembershipPlan yang ada
    await this.ensureMemberExists(dto.memberId);
    const plan = await this.findPlan(dto.membershipPlanId);

    const membership = this.membershipsRepository.create({
      memberId: dto.memberId,
      membershipPlanId: dto.membershipPlanId,
      startDate: dto.startDate,
      endDate: this.calculateEndDate(dto.startDate, plan.durationInDays),
    });
    const saved = await this.membershipsRepository.save(membership);
    return this.findOne(saved.id);
  }

  async findAll(query: QueryMembershipDto) {
    const today = todayString();
    const where: FindOptionsWhere<Membership> = {};

    if (query.memberId !== undefined) {
      where.memberId = query.memberId;
    }

    // Filter status diterjemahkan menjadi kondisi tanggal
    switch (query.status) {
      case MembershipStatus.ACTIVE:
        where.startDate = LessThanOrEqual(today);
        where.endDate = MoreThanOrEqual(today);
        break;
      case MembershipStatus.UPCOMING:
        where.startDate = MoreThan(today);
        break;
      case MembershipStatus.EXPIRED:
        where.endDate = LessThan(today);
        break;
    }

    const memberships = await this.membershipsRepository.find({
      where,
      relations: { member: true, membershipPlan: true },
      order: { id: 'ASC' },
    });
    return memberships.map(withStatus);
  }

  async findOne(id: number) {
    const membership = await this.membershipsRepository.findOne({
      where: { id },
      relations: { member: true, membershipPlan: true },
    });
    if (!membership) {
      throw new NotFoundException(`Membership dengan id ${id} tidak ditemukan`);
    }
    return withStatus(membership);
  }

  async update(id: number, dto: UpdateMembershipDto) {
    // Dimuat TANPA relasi agar perubahan kolom membershipPlanId tidak
    // "ditimpa" oleh objek relasi lama saat save().
    const membership = await this.membershipsRepository.findOne({
      where: { id },
    });
    if (!membership) {
      throw new NotFoundException(`Membership dengan id ${id} tidak ditemukan`);
    }

    if (dto.membershipPlanId !== undefined) {
      membership.membershipPlanId = dto.membershipPlanId;
    }
    if (dto.startDate !== undefined) {
      membership.startDate = dto.startDate;
    }

    // Tanggal berakhir dihitung ulang dari paket + tanggal mulai terbaru
    const plan = await this.findPlan(membership.membershipPlanId);
    membership.endDate = this.calculateEndDate(
      membership.startDate,
      plan.durationInDays,
    );

    await this.membershipsRepository.save(membership);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const membership = await this.membershipsRepository.findOne({
      where: { id },
    });
    if (!membership) {
      throw new NotFoundException(`Membership dengan id ${id} tidak ditemukan`);
    }
    await this.membershipsRepository.remove(membership);
  }

  /**
   * endDate = startDate + durasi paket - 1 hari.
   * Contoh: paket 30 hari mulai 2026-11-01 berlaku sampai 2026-11-30
   * (tanggal mulai dihitung sebagai hari pertama).
   */
  private calculateEndDate(startDate: string, durationInDays: number): string {
    return addDays(startDate, durationInDays - 1);
  }

  private async ensureMemberExists(memberId: number): Promise<void> {
    const exists = await this.membersRepository.exists({
      where: { id: memberId },
    });
    if (!exists) {
      throw new NotFoundException(
        `Member dengan id ${memberId} tidak ditemukan`,
      );
    }
  }

  private async findPlan(planId: number): Promise<MembershipPlan> {
    const plan = await this.plansRepository.findOne({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException(
        `Membership plan dengan id ${planId} tidak ditemukan`,
      );
    }
    return plan;
  }
}
