import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroEye, heroEyeSlash } from '@ng-icons/heroicons/outline';

import { confirmPasswordValidator } from '../../../../shared/validators/confirm-password.validator';
import { passwordStrengthValidator } from '../../../../shared/validators/password.validator';

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
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  token = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token.set(params['token']);
      } else {
        this.errorMessage.set('Invalid or missing password reset token.');
      }
    });
  }
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  resetForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, passwordStrengthValidator({ minLength: 6 })]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: confirmPasswordValidator('newPassword', 'confirmPassword') });

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

  onSubmit(): void {

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    if (!this.token()) {
      this.errorMessage.set('Invalid or missing password reset token.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const passwordValue = this.newPassword.value;

    this.authService.resetPassword(this.token()!, passwordValue).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastr.success('Password has been reset successfully.', 'Success');
        void this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Reset password error', err);
        
        let msg = 'Failed to reset password. Please try again.';
        if (err.error && err.error.message) {
          msg = err.error.message;
        }
        this.errorMessage.set(msg);
      }
    });
  }
}
