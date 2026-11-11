import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { dateOnlyTransformer } from '../../../common/transformers/date-only.transformer';
import { Membership } from '../../memberships/entities/membership.entity';
import { SessionParticipant } from '../../session-participants/entities/session-participant.entity';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  // unique: true -> database menolak email ganda (Business Rule #1)
  @Column({ length: 100, unique: true })
  email: string;

  @Column({ name: 'phone_number', length: 20, unique: true })
  phoneNumber: string;

  // Kolom `date` di PostgreSQL, dipetakan ke Date lewat dateOnlyTransformer
  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
    transformer: dateOnlyTransformer,
  })
  dateOfBirth: Date | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  // Satu Member punya banyak Membership
  @OneToMany(() => Membership, (membership) => membership.member)
  memberships: Membership[];

  // Satu Member bisa ikut banyak sesi (lewat tabel session_participants)
  @OneToMany(() => SessionParticipant, (participant) => participant.member)
  sessionParticipants: SessionParticipant[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
