import { applyDecorators } from '@nestjs/common';
import { IsISO8601, Matches } from 'class-validator';

/**
 * Validasi tanggal tanpa jam: harus berformat YYYY-MM-DD dan benar-benar ada
 * di kalender (2026-02-30 ditolak).
 */
export function IsDateOnly() {
  return applyDecorators(
    Matches(/^\d{4}-\d{2}-\d{2}$/, {
      message: '$property must be in YYYY-MM-DD format',
    }),
    IsISO8601({ strict: true }, { message: '$property must be a valid date' }),
  );
}
