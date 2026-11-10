import { IsInt, Min } from 'class-validator';
import { IsDateOnly } from '../../../common/decorators/is-date-only.decorator';

export class CreateMembershipDto {
  @IsInt()
  @Min(1)
  memberId: number;

  @IsInt()
  @Min(1)
  membershipPlanId: number;

  // Hanya tanggal mulai yang dikirim client; tanggal berakhir dihitung server.
  @IsDateOnly()
  startDate: string;
}
