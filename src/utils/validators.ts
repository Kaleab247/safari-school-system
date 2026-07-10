export const validators = {
  isEmail: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isPhone: (phone: string): boolean => {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone);
  },

  isNumeric: (value: string): boolean => {
    return /^\d+$/.test(value);
  },

  isPositiveNumber: (value: number): boolean => {
    return value > 0;
  },

  isWithinRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  isValidGrade: (grade: string): boolean => {
    return ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'].includes(grade);
  },

  isValidScore: (score: number): boolean => {
    return score >= 0 && score <= 100;
  },

  sanitizeString: (str: string): string => {
    return str.trim().replace(/[<>]/g, '');
  }
};