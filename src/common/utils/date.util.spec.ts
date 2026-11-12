import { addDays, toDateOnly } from './date.util';

const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe('date.util', () => {
  describe('addDays', () => {
    it('menambah hari dalam bulan yang sama', () => {
      expect(addDays(d('2026-11-01'), 29)).toEqual(d('2026-11-30'));
    });

    it('melewati pergantian bulan dan tahun', () => {
      expect(addDays(d('2026-12-25'), 10)).toEqual(d('2027-01-04'));
    });

    it('memperhitungkan tahun kabisat', () => {
      expect(addDays(d('2028-02-28'), 1)).toEqual(d('2028-02-29'));
    });

    it('tidak mengubah Date asli', () => {
      const start = d('2026-11-01');
      addDays(start, 5);
      expect(start).toEqual(d('2026-11-01'));
    });
  });

  describe('toDateOnly', () => {
    it('membuang jam dan menghasilkan tengah malam UTC', () => {
      expect(toDateOnly(new Date(2026, 0, 5, 15, 30))).toEqual(d('2026-01-05'));
    });
  });
});
