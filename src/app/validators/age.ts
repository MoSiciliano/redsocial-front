// src/app/validators/age.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ageRangeValidator(minAge: number, maxAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Si no hay valor, que lo maneje el 'required'
    }

    const birthDate = new Date(control.value);
    if (isNaN(birthDate.getTime())) {
      return { invalidDate: true }; // Fecha inválida
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    // Ajuste si todavía no cumplió años este año
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < minAge) {
      return { minAge: { requiredAge: minAge, actualAge: age } };
    }

    if (age > maxAge) {
      return { maxAge: { requiredAge: maxAge, actualAge: age } };
    }

    return null; // Edad válida
  };
}