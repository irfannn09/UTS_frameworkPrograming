import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../members/entities/member.entity';
import { MembershipPlan } from '../membership-plans/entities/membership-plan.entity';
import { Membership } from './entities/membership.entity';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';

@Module({
  imports: [TypeOrmModule.forFeature([Membership, Member, MembershipPlan])],
  controllers: [MembershipsController],
  providers: [MembershipsService],
})
export class MembershipsModule {}
