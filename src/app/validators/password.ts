import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador para confirmar que las contraseñas coinciden.
 */
export function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}