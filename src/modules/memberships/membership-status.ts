import { today as getToday } from '../../common/utils/date.util';

export enum MembershipStatus {
  UPCOMING = 'UPCOMING', // belum mulai
  ACTIVE = 'ACTIVE', // sedang berlaku
  EXPIRED = 'EXPIRED', // sudah berakhir
}

/**
 * Business Rule #3: status ditentukan dari masa berlaku (tidak disimpan di DB).
 * Semua tanggal adalah Date tengah malam UTC, jadi aman dibandingkan dengan
 * getTime().
 */
export function getMembershipStatus(
  startDate: Date,
  endDate: Date,
  today: Date = getToday(),
): MembershipStatus {
  if (startDate.getTime() > today.getTime()) return MembershipStatus.UPCOMING;
  if (endDate.getTime() < today.getTime()) return MembershipStatus.EXPIRED;
  return MembershipStatus.ACTIVE;
}

/** Menambahkan properti `status` ke data membership untuk response. */
export function withStatus<T extends { startDate: Date; endDate: Date }>(
  membership: T,
) {
  return {
    ...membership,
    status: getMembershipStatus(membership.startDate, membership.endDate),
  };
}
