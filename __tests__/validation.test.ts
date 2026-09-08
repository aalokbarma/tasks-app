import {
  normalizeEmail,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '../src/utils/validation';

describe('auth validation', () => {
  it('normalizes and validates email', () => {
    expect(normalizeEmail('  Ada@Example.com ')).toBe('ada@example.com');
    expect(validateEmail('').valid).toBe(false);
    expect(validateEmail('not-an-email').valid).toBe(false);
    expect(validateEmail('ada@example.com').valid).toBe(true);
  });

  it('validates password length', () => {
    expect(validatePassword('12345').valid).toBe(false);
    expect(validatePassword('123456').valid).toBe(true);
  });

  it('validates optional display name and confirmation', () => {
    expect(validateDisplayName('').valid).toBe(true);
    expect(validateDisplayName('A').valid).toBe(false);
    expect(validateDisplayName('Ada').valid).toBe(true);
    expect(validatePasswordConfirmation('secret1', 'secret2').valid).toBe(
      false,
    );
    expect(validatePasswordConfirmation('secret1', 'secret1').valid).toBe(true);
  });
});
