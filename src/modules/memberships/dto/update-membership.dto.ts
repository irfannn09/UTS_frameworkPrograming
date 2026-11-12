import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateMembershipDto } from './create-membership.dto';

// Member pada sebuah membership tidak boleh diganti (memberId dibuang dari DTO).
export class UpdateMembershipDto extends PartialType(
  OmitType(CreateMembershipDto, ['memberId'] as const),
) {}
