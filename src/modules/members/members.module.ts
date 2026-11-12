import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from '../memberships/entities/membership.entity';
import { Member } from './entities/member.entity';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  // forFeature: mendaftarkan entity yang dipakai modul ini agar Repository-nya
  // bisa di-inject ke service lewat @InjectRepository.
  imports: [TypeOrmModule.forFeature([Member, Membership])],
  controllers: [MembersController],
  providers: [MembersService],
})
export class MembersModule {}
