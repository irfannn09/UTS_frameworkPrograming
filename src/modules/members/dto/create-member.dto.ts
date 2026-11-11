import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { IsDateOnly } from '../../../common/decorators/is-date-only.decorator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class CreateMemberDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  // class-transformer: email dirapikan (trim + huruf kecil) sebelum divalidasi,
  // sehingga "Budi@Mail.com" dan "budi@mail.com" dianggap duplikat.
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

  @IsOptional()
  @IsDateOnly()
  dateOfBirth?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(255)
  address?: string;
}
