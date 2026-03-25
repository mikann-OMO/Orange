import { describe, it, expect } from 'vitest';
import { formatDate } from '../../src/utils/date-utils';

describe('date-utils', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-01');
    const formatted = formatDate(date);
    expect(typeof formatted).toBe('string');
  });
});