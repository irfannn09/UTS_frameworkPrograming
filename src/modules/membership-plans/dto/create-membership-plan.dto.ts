import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class CreateMembershipPlanDto {
  @Trim()
  @IsNotEmpty({ message: 'Nama paket tidak boleh kosong' })
  @IsString({ message: 'Nama paket harus berupa teks' })
  @MaxLength(100, { message: 'Nama paket maksimal 100 karakter' })
  readonly name: string;

  @IsOptional()
  @Trim()
  @IsString({ message: 'Deskripsi harus berupa teks' })
  readonly description?: string;

  // Durasi paket dalam hari (minimal 1 hari, maksimal 10 tahun)
  @IsNotEmpty({ message: 'Durasi paket tidak boleh kosong' })
  @IsInt({ message: 'Durasi paket harus berupa bilangan bulat (hari)' })
  @Min(1, { message: 'Durasi paket minimal 1 hari' })
  @Max(3650, { message: 'Durasi paket maksimal 3650 hari' })
  readonly durationInDays: number;

  // Harga harus lebih dari 0, maksimal 2 angka desimal
  @IsNotEmpty({ message: 'Harga tidak boleh kosong' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Harga harus berupa angka dengan maksimal 2 desimal' },
  )
  @IsPositive({ message: 'Harga harus lebih dari 0' })
  @Max(9999999999, { message: 'Harga terlalu besar' })
  readonly price: number;
}
