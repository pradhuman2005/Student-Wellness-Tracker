import { describe, it, expect } from 'vitest';
import { calculateAverageStress, getTopTriggers } from './wellnessCalculations';

describe('wellnessCalculations', () => {
  describe('calculateAverageStress', () => {
    it('should return 0.0 for empty logs', () => {
      expect(calculateAverageStress([])).toBe('0.0');
      expect(calculateAverageStress(null)).toBe('0.0');
    });

    it('should correctly calculate the average stress level', () => {
      const mockLogs = [
        { stressLevel: 5 },
        { stressLevel: 8 },
        { stressLevel: 2 },
      ];
      // Average: (5 + 8 + 2) / 3 = 5.0
      expect(calculateAverageStress(mockLogs)).toBe('5.0');
    });
  });

  describe('getTopTriggers', () => {
    it('should return an empty array for empty logs', () => {
      expect(getTopTriggers([])).toEqual([]);
    });

    it('should correctly identify and sort the most frequent triggers', () => {
      const mockLogs = [
        { triggers: ['Exam', 'Sleep'] },
        { triggers: ['Exam', 'Family'] },
        { triggers: ['Sleep', 'Exam', 'Procrastination'] },
      ];
      
      const result = getTopTriggers(mockLogs, 2);
      expect(result).toHaveLength(2);
      expect(result[0].trigger).toBe('Exam');
      expect(result[0].count).toBe(3);
      expect(result[1].trigger).toBe('Sleep');
      expect(result[1].count).toBe(2);
    });
  });
});
