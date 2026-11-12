import { ValueTransformer } from 'typeorm';

/**
 * Kolom `date` di PostgreSQL dibaca TypeORM sebagai string 'YYYY-MM-DD'.
 * Transformer ini membuat entity memakai tipe Date (tengah malam UTC):
 *  - ke database : Date -> 'YYYY-MM-DD'
 *  - dari database: 'YYYY-MM-DD' -> Date
 * Dipakai juga oleh operator pencarian (LessThanOrEqual, dst.).
 */
export const dateOnlyTransformer: ValueTransformer = {
  to: (value?: Date | null) =>
    value instanceof Date ? value.toISOString().slice(0, 10) : value,
  from: (value?: string | null) =>
    typeof value === 'string' ? new Date(`${value}T00:00:00.000Z`) : value,
};
