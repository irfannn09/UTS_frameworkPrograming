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
  @IsInt()
  @Min(1)
  trainerId: number;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @Trim()
  @IsString()
  description?: string;

  // class-transformer: teks ISO 8601 dari JSON diubah menjadi objek Date,
  // lalu class-validator memeriksa bahwa itu tanggal yang valid.
  // Contoh nilai: "2026-11-20T08:00:00+07:00"
  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;

  // Kapasitas masuk akal: 1 sampai 500 peserta
  @IsInt()
  @Min(1)
  @Max(500)
  capacity: number;
}
