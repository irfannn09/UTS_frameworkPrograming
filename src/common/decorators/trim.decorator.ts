import { Transform } from 'class-transformer';

/** class-transformer: membuang spasi di awal/akhir string sebelum divalidasi. */
export function Trim() {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}
