import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateMembershipDto {
  @IsNotEmpty({ message: 'ID member tidak boleh kosong' })
  @IsInt({ message: 'ID member harus berupa bilangan bulat' })
  @Min(1, { message: 'ID member minimal 1' })
  readonly memberId: number;

  @IsNotEmpty({ message: 'ID paket membership tidak boleh kosong' })
  @IsInt({ message: 'ID paket membership harus berupa bilangan bulat' })
  @Min(1, { message: 'ID paket membership minimal 1' })
  readonly membershipPlanId: number;

  // Hanya tanggal mulai yang dikirim client; tanggal berakhir dihitung server.
  // Contoh nilai: "2026-11-10"
  @IsNotEmpty({ message: 'Tanggal mulai tidak boleh kosong' })
  @Type(() => Date)
  @IsDate({ message: 'Tanggal mulai harus berupa tanggal yang valid' })
  readonly startDate: Date;
}
