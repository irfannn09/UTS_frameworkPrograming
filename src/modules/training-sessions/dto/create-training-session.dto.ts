import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class CreateTrainingSessionDto {
  @IsNotEmpty({ message: 'ID trainer tidak boleh kosong' })
  @IsInt({ message: 'ID trainer harus berupa bilangan bulat' })
  @Min(1, { message: 'ID trainer minimal 1' })
  readonly trainerId: number;

  @Trim()
  @IsNotEmpty({ message: 'Judul sesi tidak boleh kosong' })
  @IsString({ message: 'Judul sesi harus berupa teks' })
  @MaxLength(100, { message: 'Judul sesi maksimal 100 karakter' })
  readonly title: string;

  @IsOptional()
  @Trim()
  @IsString({ message: 'Deskripsi harus berupa teks' })
  readonly description?: string;

  // Teks ISO 8601 dari JSON diubah menjadi Date, lalu divalidasi.
  // Contoh nilai: "2026-11-20T08:00:00+07:00"
  @IsNotEmpty({ message: 'Waktu mulai tidak boleh kosong' })
  @Type(() => Date)
  @IsDate({ message: 'Waktu mulai harus berupa tanggal dan jam yang valid' })
  readonly startTime: Date;

  @IsNotEmpty({ message: 'Waktu selesai tidak boleh kosong' })
  @Type(() => Date)
  @IsDate({ message: 'Waktu selesai harus berupa tanggal dan jam yang valid' })
  readonly endTime: Date;

  // Kapasitas masuk akal: 1 sampai 500 peserta
  @IsNotEmpty({ message: 'Kapasitas tidak boleh kosong' })
  @IsInt({ message: 'Kapasitas harus berupa bilangan bulat' })
  @Min(1, { message: 'Kapasitas minimal 1 peserta' })
  @Max(500, { message: 'Kapasitas maksimal 500 peserta' })
  readonly capacity: number;
}
