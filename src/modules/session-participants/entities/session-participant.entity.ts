import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { TrainingSession } from '../../training-sessions/entities/training-session.entity';

export enum AttendanceStatus {
  REGISTERED = 'REGISTERED',
  ATTENDED = 'ATTENDED',
  ABSENT = 'ABSENT',
}

/**
 * Tabel penghubung Member <-> TrainingSession (relasi many-to-many).
 * Dibuat sebagai entity biasa (dua @ManyToOne) karena punya kolom sendiri
 * (attendanceStatus) dan endpoint sendiri.
 */
@Entity('session_participants')
// Satu Member hanya boleh terdaftar sekali pada satu sesi (Business Rule #8)
@Unique('uq_session_participant_member_session', [
  'memberId',
  'trainingSessionId',
])
export class SessionParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'member_id' })
  memberId: number;

  @ManyToOne(() => Member, (member) => member.sessionParticipants, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ name: 'training_session_id' })
  trainingSessionId: number;

  @ManyToOne(() => TrainingSession, (session) => session.participants, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'training_session_id' })
  trainingSession: TrainingSession;

  @Column({
    name: 'attendance_status',
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.REGISTERED,
  })
  attendanceStatus: AttendanceStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
