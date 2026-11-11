import { dateOnlyTransformer } from './date-only.transformer';

describe('dateOnlyTransformer', () => {
  it('string database -> Date tengah malam UTC', () => {
    expect(dateOnlyTransformer.from('2026-11-10')).toEqual(
      new Date('2026-11-10T00:00:00.000Z'),
    );
  });

  it('Date -> string YYYY-MM-DD', () => {
    expect(dateOnlyTransformer.to(new Date('2026-11-10T00:00:00.000Z'))).toBe(
      '2026-11-10',
    );
  });

  it('null/undefined dibiarkan apa adanya', () => {
    expect(dateOnlyTransformer.from(null)).toBeNull();
    expect(dateOnlyTransformer.to(null)).toBeNull();
  });
});
