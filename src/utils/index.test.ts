import {
  formatDate,
  formatNumber,
  formatCurrency,
  formatPercentage,
  getStatusColor,
  getSeverityColor,
  getDepotColor,
  getFitnessScoreColor,
  getMileageColor,
  debounce,
  throttle,
  sortBy,
  groupBy,
} from './index';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = '2025-09-18T10:30:00Z';
      expect(formatDate(date)).toBe('Sep 18, 2025');
    });

    it('handles invalid date', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with Indian locale', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1234567, 2)).toBe('1,234,567.00');
    });
  });

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1234567)).toBe('₹1,234,567');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage correctly', () => {
      expect(formatPercentage(94.567)).toBe('94.6%');
    });
  });

  describe('getStatusColor', () => {
    it('returns correct colors for different statuses', () => {
      expect(getStatusColor('active')).toContain('success');
      expect(getStatusColor('pending')).toContain('warning');
      expect(getStatusColor('error')).toContain('danger');
    });
  });

  describe('getSeverityColor', () => {
    it('returns correct colors for different severities', () => {
      expect(getSeverityColor('critical')).toContain('danger');
      expect(getSeverityColor('high')).toContain('warning');
      expect(getSeverityColor('low')).toContain('gray');
    });
  });

  describe('getDepotColor', () => {
    it('returns correct colors for different depots', () => {
      expect(getDepotColor('A')).toContain('blue');
      expect(getDepotColor('B')).toContain('green');
      expect(getDepotColor('C')).toContain('purple');
    });
  });

  describe('getFitnessScoreColor', () => {
    it('returns correct colors for fitness scores', () => {
      expect(getFitnessScoreColor(0.95)).toContain('success');
      expect(getFitnessScoreColor(0.75)).toContain('warning');
      expect(getFitnessScoreColor(0.45)).toContain('danger');
    });
  });

  describe('getMileageColor', () => {
    it('returns correct colors for mileage ranges', () => {
      expect(getMileageColor(50000)).toContain('success');
      expect(getMileageColor(125000)).toContain('warning');
      expect(getMileageColor(200000)).toContain('danger');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debounces function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('throttles function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('sortBy', () => {
    it('sorts array by key in ascending order', () => {
      const data = [{ id: 3 }, { id: 1 }, { id: 2 }];
      const result = sortBy(data, 'id', 'asc');
      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });

    it('sorts array by key in descending order', () => {
      const data = [{ id: 1 }, { id: 3 }, { id: 2 }];
      const result = sortBy(data, 'id', 'desc');
      expect(result).toEqual([{ id: 3 }, { id: 2 }, { id: 1 }]);
    });
  });

  describe('groupBy', () => {
    it('groups array by key', () => {
      const data = [
        { depot: 'A', id: 1 },
        { depot: 'B', id: 2 },
        { depot: 'A', id: 3 },
      ];
      const result = groupBy(data, 'depot');
      expect(result).toEqual({
        A: [
          { depot: 'A', id: 1 },
          { depot: 'A', id: 3 },
        ],
        B: [{ depot: 'B', id: 2 }],
      });
    });
  });
});
