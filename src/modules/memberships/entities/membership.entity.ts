import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { dateOnlyTransformer } from '../../../common/transformers/date-only.transformer';
import { Member } from '../../members/entities/member.entity';
import { MembershipPlan } from '../../membership-plans/entities/membership-plan.entity';

@Entity('memberships')
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  // Kolom Foreign Key -> members.id
  @Column({ name: 'member_id' })
  memberId: number;

  // RESTRICT: Member tidak bisa dihapus selama masih punya Membership
  @ManyToOne(() => Member, (member) => member.memberships, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  // Kolom Foreign Key -> membership_plans.id
  @Column({ name: 'membership_plan_id' })
  membershipPlanId: number;

  @ManyToOne(() => MembershipPlan, (plan) => plan.memberships, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'membership_plan_id' })
  membershipPlan: MembershipPlan;

  @Column({
    name: 'start_date',
    type: 'date',
    transformer: dateOnlyTransformer,
  })
  startDate: Date;

  // Dihitung server: startDate + durasi paket - 1 hari
  @Column({ name: 'end_date', type: 'date', transformer: dateOnlyTransformer })
  endDate: Date;

  // CATATAN: status (UPCOMING/ACTIVE/EXPIRED) TIDAK disimpan, tetapi dihitung
  // dari startDate dan endDate setiap kali data dibaca.

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
