/**
 * Utility tanggal. Tanggal "tanpa jam" direpresentasikan sebagai objek Date
 * pada tengah malam UTC (lihat dateOnlyTransformer), sehingga bebas masalah
 * zona waktu dan bisa dibandingkan dengan getTime().
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Mengambil bagian tanggal (zona waktu server) menjadi Date tengah malam UTC. */
export function toDateOnly(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
}

/** Hari ini sebagai Date tengah malam UTC. */
export function today(): Date {
  return toDateOnly(new Date());
}

/** Menambah (atau mengurangi) hari; hasilnya Date baru. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}
