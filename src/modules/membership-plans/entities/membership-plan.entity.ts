import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Membership } from '../../memberships/entities/membership.entity';

/**
 * PostgreSQL mengembalikan tipe `decimal` sebagai string ("150000.00").
 * Transformer ini mengubahnya menjadi number agar response API berupa angka.
 */
const decimalTransformer = {
  to: (value?: number) => value,
  from: (value: string | null) => (value === null ? null : parseFloat(value)),
};

@Entity('membership_plans')
export class MembershipPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'duration_in_days', type: 'int' })
  durationInDays: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  // Satu MembershipPlan dipakai oleh banyak Membership
  @OneToMany(() => Membership, (membership) => membership.membershipPlan)
  memberships: Membership[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
