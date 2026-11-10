import { getMembershipStatus, MembershipStatus } from './membership-status';

describe('getMembershipStatus (Business Rule #3)', () => {
  const today = '2026-11-10';

  it('UPCOMING jika tanggal mulai belum tiba', () => {
    expect(getMembershipStatus('2026-11-11', '2026-12-10', today)).toBe(
      MembershipStatus.UPCOMING,
    );
  });

  it('ACTIVE jika hari ini berada di dalam masa berlaku', () => {
    expect(getMembershipStatus('2026-10-20', '2026-11-18', today)).toBe(
      MembershipStatus.ACTIVE,
    );
  });

  it('ACTIVE pada hari pertama dan hari terakhir masa berlaku', () => {
    expect(getMembershipStatus('2026-11-10', '2026-12-09', today)).toBe(
      MembershipStatus.ACTIVE,
    );
    expect(getMembershipStatus('2026-10-12', '2026-11-10', today)).toBe(
      MembershipStatus.ACTIVE,
    );
  });

  it('EXPIRED jika tanggal berakhir sudah lewat', () => {
    expect(getMembershipStatus('2026-09-01', '2026-09-30', today)).toBe(
      MembershipStatus.EXPIRED,
    );
  });
});
