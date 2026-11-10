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
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @Trim()
  @IsString()
  description?: string;

  // Durasi paket dalam hari (minimal 1 hari, maksimal 10 tahun)
  @IsInt()
  @Min(1)
  @Max(3650)
  durationInDays: number;

  // Harga harus lebih dari 0, maksimal 2 angka desimal
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(9999999999)
  price: number;
}
