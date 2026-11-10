import { addDays, toDateString } from './date.util';

describe('date.util', () => {
  describe('addDays', () => {
    it('menambah hari dalam bulan yang sama', () => {
      expect(addDays('2026-11-01', 29)).toBe('2026-11-30');
    });

    it('melewati pergantian bulan dan tahun', () => {
      expect(addDays('2026-12-25', 10)).toBe('2027-01-04');
    });

    it('memperhitungkan tahun kabisat', () => {
      expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    });
  });

  describe('toDateString', () => {
    it('memformat Date menjadi YYYY-MM-DD dengan nol di depan', () => {
      expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
    });
  });
});
