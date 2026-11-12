import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SessionParticipant } from '../../session-participants/entities/session-participant.entity';
import { Trainer } from '../../trainers/entities/trainer.entity';

@Entity('training_sessions')
export class TrainingSession {
  @PrimaryGeneratedColumn()
  id: number;

  // Kolom Foreign Key -> trainers.id (wajib: Business Rule #5)
  @Column({ name: 'trainer_id' })
  trainerId: number;

  @ManyToOne(() => Trainer, (trainer) => trainer.trainingSessions, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'trainer_id' })
  trainer: Trainer;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // timestamptz = timestamp + zona waktu (menghindari ambiguitas jam)
  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz' })
  endTime: Date;

  @Column({ type: 'int' })
  capacity: number;

  // Satu TrainingSession punya banyak SessionParticipant
  @OneToMany(() => SessionParticipant, (p) => p.trainingSession)
  participants: SessionParticipant[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
