import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateSessionParticipantDto {
  @IsNotEmpty({ message: 'ID member tidak boleh kosong' })
  @IsInt({ message: 'ID member harus berupa bilangan bulat' })
  @Min(1, { message: 'ID member minimal 1' })
  readonly memberId: number;

  @IsNotEmpty({ message: 'ID training session tidak boleh kosong' })
  @IsInt({ message: 'ID training session harus berupa bilangan bulat' })
  @Min(1, { message: 'ID training session minimal 1' })
  readonly trainingSessionId: number;
}
