import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { MembershipStatus } from '../membership-status';

// Query string: GET /memberships?memberId=1&status=ACTIVE
export class QueryMembershipDto {
  // Query string selalu berupa teks; @Type mengubahnya menjadi number.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  memberId?: number;

  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;
}
