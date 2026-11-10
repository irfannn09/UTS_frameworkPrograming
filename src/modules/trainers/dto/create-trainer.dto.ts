import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class CreateTrainerDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(100)
  email: string;

  @Trim()
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'phoneNumber must contain 8-15 digits (may start with +)',
  })
  phoneNumber: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  specialization: string;
}
