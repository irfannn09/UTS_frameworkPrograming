import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

// Query string: GET /session-participants?trainingSessionId=1&memberId=2
export class QuerySessionParticipantDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID training session harus berupa bilangan bulat' })
  @Min(1, { message: 'ID training session minimal 1' })
  readonly trainingSessionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID member harus berupa bilangan bulat' })
  @Min(1, { message: 'ID member minimal 1' })
  readonly memberId?: number;
}
