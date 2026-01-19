/**
 * Validation utilities for form inputs
 */

import type { Discipline, ValidationError } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;

export function validateEmail(email: string): ValidationError | null {
  if (!email || email.trim().length === 0) {
    return { field: 'email', message: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }

  return null;
}

export function validateName(name: string): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { field: 'name', message: 'Name must be at least 2 characters' };
  }

  if (name.trim().length > 50) {
    return { field: 'name', message: 'Name must be less than 50 characters' };
  }

  if (!NAME_REGEX.test(name)) {
    return {
      field: 'name',
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    };
  }

  return null;
}

export function validateDisciplines(
  disciplines: Discipline[]
): ValidationError | null {
  if (!disciplines || disciplines.length === 0) {
    return {
      field: 'disciplines',
      message: 'Please select at least one discipline',
    };
  }

  const validDisciplines: Discipline[] = ['Software', 'Hardware', 'Creative'];
  const invalidDisciplines = disciplines.filter(
    (d) => !validDisciplines.includes(d)
  );

  if (invalidDisciplines.length > 0) {
    return { field: 'disciplines', message: 'Invalid discipline selected' };
  }

  return null;
}

export function validateReason(reason: string): ValidationError | null {
  if (!reason || reason.trim().length === 0) {
    return { field: 'reason', message: 'Reason for visit is required' };
  }

  if (reason.trim().length < 10) {
    return {
      field: 'reason',
      message: 'Reason must be at least 10 characters',
    };
  }

  if (reason.trim().length > 500) {
    return {
      field: 'reason',
      message: 'Reason must be less than 500 characters',
    };
  }

  return null;
}

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove inline event handlers
}

/**
 * Validate all form fields and return array of errors
 */
export function validateCheckInForm(data: {
  email: string;
  name: string;
  disciplines: Discipline[];
  reason: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);

  const nameError = validateName(data.name);
  if (nameError) errors.push(nameError);

  const disciplinesError = validateDisciplines(data.disciplines);
  if (disciplinesError) errors.push(disciplinesError);

  const reasonError = validateReason(data.reason);
  if (reasonError) errors.push(reasonError);

  return errors;
}
