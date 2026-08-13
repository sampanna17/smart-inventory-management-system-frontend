import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Cross-field validator that checks if two password form controls match.
 * Returns `{ mismatch: true }` on mismatch for seamless template error binding.
 *
 * @param passwordControlName The name of the primary password control (e.g. 'newPassword' or 'password')
 * @param confirmPasswordControlName The name of the confirmation password control (e.g. 'confirmPassword')
 */
export function confirmPasswordValidator(
  passwordControlName: string = 'newPassword',
  confirmPasswordControlName: string = 'confirmPassword'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordControlName)?.value;
    const confirmPassword = control.get(confirmPasswordControlName)?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    if (password !== confirmPassword) {
      return { mismatch: true };
    }

    return null;
  };
}
