import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionParticipant } from '../session-participants/entities/session-participant.entity';
import { Trainer } from '../trainers/entities/trainer.entity';
import { TrainingSession } from './entities/training-session.entity';
import { TrainingSessionsController } from './training-sessions.controller';
import { TrainingSessionsService } from './training-sessions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingSession, Trainer, SessionParticipant]),
  ],
  controllers: [TrainingSessionsController],
  providers: [TrainingSessionsService],
})
export class TrainingSessionsModule {}
