import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TrainingSession } from '../../training-sessions/entities/training-session.entity';

@Entity('trainers')
export class Trainer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ name: 'phone_number', length: 20, unique: true })
  phoneNumber: string;

  @Column({ length: 100 })
  specialization: string;

  // Satu Trainer menangani banyak TrainingSession
  @OneToMany(() => TrainingSession, (session) => session.trainer)
  trainingSessions: TrainingSession[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
