import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

// Query string: GET /session-participants?trainingSessionId=1&memberId=2
export class QuerySessionParticipantDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  trainingSessionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  memberId?: number;
}
