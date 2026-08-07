import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isInvalid()) {
      <p class="mt-1 text-xs text-red-500 font-medium">
        {{ getErrorMessage() }}
      </p>
    }
  `
})
export class FormErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() message: string = '';

  isInvalid(): boolean {
    return !!(this.control && this.control.invalid && (this.control.dirty || this.control.touched));
  }

  getErrorMessage(): string {
    if (this.message) return this.message;
    if (!this.control || !this.control.errors) return 'Invalid field.';

    const errors = this.control.errors;
    if (errors['required']) return 'This field is required.';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters.`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters.`;
    if (errors['min']) return `Value must be ${errors['min'].min} or greater.`;
    if (errors['email']) return 'Please enter a valid email address.';

    return 'Invalid value.';
  }
}
