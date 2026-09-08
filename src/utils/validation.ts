export interface FieldValidationResult {
  valid: boolean;
  message: string | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): FieldValidationResult {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    return {valid: false, message: 'Email is required.'};
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return {valid: false, message: 'Enter a valid email address.'};
  }

  return {valid: true, message: null};
}

export function validatePassword(
  password: string,
  options?: {minLength?: number},
): FieldValidationResult {
  const minLength = options?.minLength ?? 6;

  if (!password) {
    return {valid: false, message: 'Password is required.'};
  }

  if (password.length < minLength) {
    return {
      valid: false,
      message: `Password must be at least ${minLength} characters.`,
    };
  }

  return {valid: true, message: null};
}

export function validateDisplayName(
  displayName: string,
  options?: {required?: boolean},
): FieldValidationResult {
  const trimmed = displayName.trim();
  const required = options?.required ?? false;

  if (!trimmed) {
    if (required) {
      return {valid: false, message: 'Name is required.'};
    }

    return {valid: true, message: null};
  }

  if (trimmed.length < 2) {
    return {valid: false, message: 'Name must be at least 2 characters.'};
  }

  return {valid: true, message: null};
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): FieldValidationResult {
  if (!confirmation) {
    return {valid: false, message: 'Confirm your password.'};
  }

  if (password !== confirmation) {
    return {valid: false, message: 'Passwords do not match.'};
  }

  return {valid: true, message: null};
}
