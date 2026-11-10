import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMembershipPlanDto } from './dto/create-membership-plan.dto';
import { UpdateMembershipPlanDto } from './dto/update-membership-plan.dto';
import { MembershipPlan } from './entities/membership-plan.entity';

@Injectable()
export class MembershipPlansService {
  constructor(
    @InjectRepository(MembershipPlan)
    private readonly plansRepository: Repository<MembershipPlan>,
  ) {}

  async create(dto: CreateMembershipPlanDto): Promise<MembershipPlan> {
    await this.ensureNameUnique(dto.name);
    const plan = this.plansRepository.create(dto);
    return this.plansRepository.save(plan);
  }

  findAll(): Promise<MembershipPlan[]> {
    return this.plansRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<MembershipPlan> {
    const plan = await this.plansRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(
        `Membership plan dengan id ${id} tidak ditemukan`,
      );
    }
    return plan;
  }

  async update(
    id: number,
    dto: UpdateMembershipPlanDto,
  ): Promise<MembershipPlan> {
    const plan = await this.findOne(id);
    await this.ensureNameUnique(dto.name, id);
    Object.assign(plan, dto);
    return this.plansRepository.save(plan);
  }

  async remove(id: number): Promise<void> {
    const plan = await this.findOne(id);
    // Plan yang sudah dipakai Membership ditolak database (FK RESTRICT) -> 409
    await this.plansRepository.remove(plan);
  }

  private async ensureNameUnique(
    name?: string,
    ignoreId?: number,
  ): Promise<void> {
    if (!name) return;
    const existing = await this.plansRepository.findOne({ where: { name } });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException(`Paket dengan nama "${name}" sudah ada`);
    }
  }
}
