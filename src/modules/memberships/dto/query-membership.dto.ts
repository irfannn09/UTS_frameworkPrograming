import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { MembershipStatus } from '../membership-status';

// Query string: GET /memberships?memberId=1&status=ACTIVE
export class QueryMembershipDto {
  // Query string selalu berupa teks; @Type mengubahnya menjadi number.
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID member harus berupa bilangan bulat' })
  @Min(1, { message: 'ID member minimal 1' })
  readonly memberId?: number;

  @IsOptional()
  @IsEnum(MembershipStatus, {
    message: 'Status harus salah satu dari: UPCOMING, ACTIVE, EXPIRED',
  })
  readonly status?: MembershipStatus;
}
