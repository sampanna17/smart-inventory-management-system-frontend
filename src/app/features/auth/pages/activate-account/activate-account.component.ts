import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroEye, heroEyeSlash, heroCheckCircle, heroExclamationTriangle, heroPaperAirplane, heroArrowLeft } from '@ng-icons/heroicons/outline';

import { confirmPasswordValidator } from '../../../../shared/validators/confirm-password.validator';
import { passwordStrengthValidator } from '../../../../shared/validators/password.validator';

@Component({
  selector: 'app-activate-account',
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
      heroCheckCircle,
      heroExclamationTriangle,
      heroPaperAirplane,
      heroArrowLeft
    })
  ],
  templateUrl: './activate-account.component.html'
})
export class ActivateAccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);

  isValidatingToken = signal(true);
  isLoading = signal(false);
  isResending = signal(false);
  isActivated = signal(false);
  isTokenExpiredOrInvalid = signal(false);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  token = signal<string | null>(null);

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  resendSuccessMessage = signal<string | null>(null);
  resendErrorMessage = signal<string | null>(null);

  activateForm = this.fb.nonNullable.group(
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
        const cleanToken = t.trim();
        this.token.set(cleanToken);
        this.isValidatingToken.set(true);
        this.errorMessage.set(null);

        // Directly verify token validity with backend on landing
        this.authService.verifyToken(cleanToken).subscribe({
          next: () => {
            this.isValidatingToken.set(false);
            this.isTokenExpiredOrInvalid.set(false);
          },
          error: (err) => {
            this.isValidatingToken.set(false);
            this.isTokenExpiredOrInvalid.set(true);
            const msg =
              err.error?.message ||
              'This activation link has expired or is invalid.';
            this.errorMessage.set(msg);
          }
        });
      } else {
        this.token.set(null);
        this.isValidatingToken.set(false);
        this.isTokenExpiredOrInvalid.set(true);
        this.errorMessage.set('The activation token is missing, expired, or invalid.');
      }
    });
  }

  get newPassword() {
    return this.activateForm.controls.newPassword;
  }

  get confirmPassword() {
    return this.activateForm.controls.confirmPassword;
  }

  get resendEmail() {
    return this.resendForm.controls.email;
  }

  togglePassword(): void {
    this.hidePassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.hideConfirmPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.activateForm.invalid) {
      this.activateForm.markAllAsTouched();
      return;
    }

    const currentToken = this.token();
    if (!currentToken) {
      this.isTokenExpiredOrInvalid.set(true);
      this.errorMessage.set('Invalid or missing activation token.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const passwordVal = this.newPassword.value;

    this.authService.activateAccount(currentToken, passwordVal).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.isActivated.set(true);
        const msg = res.message || 'Staff Account Activated Successfully';
        this.successMessage.set(msg);
        this.toastr.success(msg, 'Account Activated');

        // Navigate to login after short delay
        setTimeout(() => {
          void this.router.navigate(['/auth/login']);
        }, 2500);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Failed to activate account. The link may be expired or invalid.';
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

  onResendSubmit(): void {
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
        const msg = err.error?.message || 'Failed to resend activation link.';
        this.resendErrorMessage.set(msg);
      }
    });
  }
}
