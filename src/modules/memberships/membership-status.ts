import { todayString } from '../../common/utils/date.util';

export enum MembershipStatus {
  UPCOMING = 'UPCOMING', // belum mulai
  ACTIVE = 'ACTIVE', // sedang berlaku
  EXPIRED = 'EXPIRED', // sudah berakhir
}

/**
 * Business Rule #3: status ditentukan dari masa berlaku (tidak disimpan di DB).
 * Tanggal berformat 'YYYY-MM-DD' sehingga bisa dibandingkan sebagai string.
 */
export function getMembershipStatus(
  startDate: string,
  endDate: string,
  today: string = todayString(),
): MembershipStatus {
  if (startDate > today) return MembershipStatus.UPCOMING;
  if (endDate < today) return MembershipStatus.EXPIRED;
  return MembershipStatus.ACTIVE;
}

/** Menambahkan properti `status` ke data membership untuk response. */
export function withStatus<T extends { startDate: string; endDate: string }>(
  membership: T,
) {
  return {
    ...membership,
    status: getMembershipStatus(membership.startDate, membership.endDate),
  };
}
