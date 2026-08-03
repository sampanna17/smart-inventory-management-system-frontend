import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroEye, heroEyeSlash } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgOptimizedImage, AuthLayoutComponent, NgIconComponent],
  viewProviders: [provideIcons({ heroEye, heroEyeSlash })],
  templateUrl: './reset-password.component.html',
  styleUrls: []
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  isLoading = signal(false);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  resetForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  get newPassword() {
    return this.resetForm.controls.newPassword;
  }

  get confirmPassword() {
    return this.resetForm.controls.confirmPassword;
  }

  togglePassword(): void {
    this.hidePassword.update(value => !value);
  }

  toggleConfirmPassword(): void {
    this.hideConfirmPassword.update(value => !value);
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    // TODO: Connect to backend authService.resetPassword()
    setTimeout(() => {
      this.isLoading.set(false);
      this.toastr.success('Password has been reset successfully.', 'Success');
      void this.router.navigate(['/auth/login']);
    }, 1500);
  }
}
