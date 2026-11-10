import { IsInt, Min } from 'class-validator';

export class CreateSessionParticipantDto {
  @IsInt()
  @Min(1)
  memberId: number;

  @IsInt()
  @Min(1)
  trainingSessionId: number;
}
