import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroEye,
  heroEyeSlash,
  heroExclamationTriangle,
  heroCheckCircle,
  heroPaperAirplane,
  heroArrowLeft,
  heroKey,
  heroArrowPath
} from '@ng-icons/heroicons/outline';

import { confirmPasswordValidator } from '../../../../shared/validators/confirm-password.validator';
import { passwordStrengthValidator } from '../../../../shared/validators/password.validator';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgOptimizedImage,
    AuthLayoutComponent,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      heroEye,
      heroEyeSlash,
      heroExclamationTriangle,
      heroCheckCircle,
      heroPaperAirplane,
      heroArrowLeft,
      heroKey,
      heroArrowPath
    })
  ],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);

  isLoading = signal(false);
  isResending = signal(false);
  isResetSuccess = signal(false);
  isTokenExpiredOrInvalid = signal(false);

  errorMessage = signal<string | null>(null);
  token = signal<string | null>(null);

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  resendSuccessMessage = signal<string | null>(null);
  resendErrorMessage = signal<string | null>(null);

  resetForm = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, passwordStrengthValidator({ minLength: 6 })]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: confirmPasswordValidator('newPassword', 'confirmPassword') }
  );

  resendForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const t = params['token'];
      if (t && typeof t === 'string' && t.trim().length > 0) {
        this.token.set(t.trim());
        this.isTokenExpiredOrInvalid.set(false);
        this.errorMessage.set(null);
      } else {
        this.token.set(null);
        this.isTokenExpiredOrInvalid.set(true);
        this.errorMessage.set('The password reset token is missing, expired, or invalid.');
      }
    });
  }

  get newPassword() {
    return this.resetForm.controls.newPassword;
  }

  get confirmPassword() {
    return this.resetForm.controls.confirmPassword;
  }

  get resendEmail() {
    return this.resendForm.controls.email;
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

    const currentToken = this.token();
    if (!currentToken) {
      this.isTokenExpiredOrInvalid.set(true);
      this.errorMessage.set('Invalid or missing password reset token.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const passwordValue = this.newPassword.value;

    this.authService.resetPassword(currentToken, passwordValue).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isResetSuccess.set(true);
        const msg = res.message || 'Password has been reset successfully.';
        this.toastr.success(msg, 'Success');

        setTimeout(() => {
          void this.router.navigate(['/auth/login']);
        }, 2500);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Reset password error', err);

        const msg = err.error?.message || 'Failed to reset password. The link may be expired or invalid.';
        this.errorMessage.set(msg);

        // If backend returned invalid or expired token error, toggle expired view
        if (
          err.status === 400 ||
          msg.toLowerCase().includes('expired') ||
          msg.toLowerCase().includes('invalid') ||
          msg.toLowerCase().includes('token')
        ) {
          this.isTokenExpiredOrInvalid.set(true);
        }
      }
    });
  }

  onResendActivationSubmit(): void {
    if (this.resendForm.invalid) {
      this.resendForm.markAllAsTouched();
      return;
    }

    this.isResending.set(true);
    this.resendSuccessMessage.set(null);
    this.resendErrorMessage.set(null);

    const emailVal = this.resendEmail.value.trim();

    this.authService.resendActivationLink(emailVal).subscribe({
      next: (res) => {
        this.isResending.set(false);
        const msg = res.message || 'A new activation link has been sent to your email.';
        this.resendSuccessMessage.set(msg);
        this.toastr.success(msg, 'Activation Link Sent');
        this.resendForm.reset();
      },
      error: (err) => {
        this.isResending.set(false);
        console.error('Resend activation error', err);
        const msg = err.error?.message || 'Failed to resend activation link. Please verify your email.';
        this.resendErrorMessage.set(msg);
      }
    });
  }
}
