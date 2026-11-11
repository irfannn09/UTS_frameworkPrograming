import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class CreateMemberDto {
  @Trim()
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong' })
  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @MaxLength(100, { message: 'Nama lengkap maksimal 100 karakter' })
  readonly fullName: string;

  // Email dirapikan (trim + huruf kecil) sebelum divalidasi, sehingga
  // "Budi@Mail.com" dan "budi@mail.com" dianggap email yang sama.
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

  // Contoh nilai: "2000-05-20" (diubah menjadi Date oleh class-transformer)
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Tanggal lahir harus berupa tanggal yang valid' })
  readonly dateOfBirth?: Date;

  @IsOptional()
  @Trim()
  @IsString({ message: 'Alamat harus berupa teks' })
  @MaxLength(255, { message: 'Alamat maksimal 255 karakter' })
  readonly address?: string;
}
