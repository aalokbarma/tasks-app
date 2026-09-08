import {
  normalizeEmail,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '@utils/validation';

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface SignUpFormValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpFormErrors {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateLoginForm(
  values: LoginFormValues,
): {valid: true; values: LoginFormValues} | {valid: false; errors: LoginFormErrors} {
  const errors: LoginFormErrors = {};

  const emailResult = validateEmail(values.email);
  if (!emailResult.valid && emailResult.message) {
    errors.email = emailResult.message;
  }

  const passwordResult = validatePassword(values.password);
  if (!passwordResult.valid && passwordResult.message) {
    errors.password = passwordResult.message;
  }

  if (Object.keys(errors).length > 0) {
    return {valid: false, errors};
  }

  return {
    valid: true,
    values: {
      email: normalizeEmail(values.email),
      password: values.password,
    },
  };
}

export function validateSignUpForm(
  values: SignUpFormValues,
):
  | {
      valid: true;
      values: {
        displayName?: string;
        email: string;
        password: string;
      };
    }
  | {valid: false; errors: SignUpFormErrors} {
  const errors: SignUpFormErrors = {};

  const nameResult = validateDisplayName(values.displayName);
  if (!nameResult.valid && nameResult.message) {
    errors.displayName = nameResult.message;
  }

  const emailResult = validateEmail(values.email);
  if (!emailResult.valid && emailResult.message) {
    errors.email = emailResult.message;
  }

  const passwordResult = validatePassword(values.password, {minLength: 6});
  if (!passwordResult.valid && passwordResult.message) {
    errors.password = passwordResult.message;
  }

  const confirmResult = validatePasswordConfirmation(
    values.password,
    values.confirmPassword,
  );
  if (!confirmResult.valid && confirmResult.message) {
    errors.confirmPassword = confirmResult.message;
  }

  if (Object.keys(errors).length > 0) {
    return {valid: false, errors};
  }

  const trimmedName = values.displayName.trim();

  return {
    valid: true,
    values: {
      email: normalizeEmail(values.email),
      password: values.password,
      displayName: trimmedName.length > 0 ? trimmedName : undefined,
    },
  };
}
