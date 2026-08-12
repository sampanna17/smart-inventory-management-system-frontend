import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface PasswordStrengthOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
}

const DEFAULT_OPTIONS: PasswordStrengthOptions = {
  minLength: 6,
  requireUppercase: false,
  requireLowercase: false,
  requireNumber: false,
  requireSpecialChar: false
};

/**
 * Validates password strength against configurable rules.
 *
 * @param options Optional configuration for length, casing, numbers, and symbols.
 */
export function passwordStrengthValidator(options: PasswordStrengthOptions = DEFAULT_OPTIONS): ValidatorFn {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;

    if (!value) {
      return null;
    }

    const errors: ValidationErrors = {};

    if (config.minLength && value.length < config.minLength) {
      errors['minlength'] = { requiredLength: config.minLength, actualLength: value.length };
    }

    if (config.requireUppercase && !/[A-Z]/.test(value)) {
      errors['requiresUppercase'] = true;
    }

    if (config.requireLowercase && !/[a-z]/.test(value)) {
      errors['requiresLowercase'] = true;
    }

    if (config.requireNumber && !/[0-9]/.test(value)) {
      errors['requiresNumber'] = true;
    }

    if (config.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors['requiresSpecialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}
