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
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong' })
  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @MaxLength(100, { message: 'Nama lengkap maksimal 100 karakter' })
  readonly fullName: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @MaxLength(100, { message: 'Email maksimal 100 karakter' })
  readonly email: string;

  @Trim()
  @IsNotEmpty({ message: 'Nomor HP tidak boleh kosong' })
  @Matches(/^\+?[0-9]{8,15}$/, {
    message: 'Nomor HP harus 8-15 digit angka (boleh diawali tanda +)',
  })
  readonly phoneNumber: string;

  @Trim()
  @IsNotEmpty({ message: 'Spesialisasi tidak boleh kosong' })
  @IsString({ message: 'Spesialisasi harus berupa teks' })
  @MaxLength(100, { message: 'Spesialisasi maksimal 100 karakter' })
  readonly specialization: string;
}
