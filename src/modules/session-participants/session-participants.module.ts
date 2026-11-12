import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../members/entities/member.entity';
import { Membership } from '../memberships/entities/membership.entity';
import { TrainingSession } from '../training-sessions/entities/training-session.entity';
import { SessionParticipant } from './entities/session-participant.entity';
import { SessionParticipantsController } from './session-participants.controller';
import { SessionParticipantsService } from './session-participants.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SessionParticipant,
      Member,
      TrainingSession,
      Membership,
    ]),
  ],
  controllers: [SessionParticipantsController],
  providers: [SessionParticipantsService],
})
export class SessionParticipantsModule {}
