/**
 * Utility tanggal. Tanggal "tanpa jam" disimpan sebagai string 'YYYY-MM-DD'
 * (sesuai tipe kolom `date` di PostgreSQL) sehingga bebas masalah zona waktu.
 */

/** Mengubah Date menjadi 'YYYY-MM-DD' memakai zona waktu server. */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Tanggal hari ini dalam format 'YYYY-MM-DD'. */
export function todayString(): string {
  return toDateString(new Date());
}

/** Menambah (atau mengurangi) hari pada tanggal 'YYYY-MM-DD'. */
export function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
