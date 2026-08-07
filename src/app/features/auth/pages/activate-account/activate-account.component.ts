import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroEye, heroEyeSlash, heroCheckCircle, heroExclamationTriangle, heroPaperAirplane, heroArrowLeft } from '@ng-icons/heroicons/outline';

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

  token = signal<string | null>(null);
  isLoading = signal(false);
  isResending = signal(false);
  isActivated = signal(false);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  resendSuccessMessage = signal<string | null>(null);
  resendErrorMessage = signal<string | null>(null);

  showResendForm = signal(false);

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  activateForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  resendForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const t = params['token'];
      if (t) {
        this.token.set(t);
        this.errorMessage.set(null);
      } else {
        this.errorMessage.set('No activation token provided. Please check your email link or request a new one.');
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

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
  }

  toggleResendForm(): void {
    this.showResendForm.update(v => !v);
    this.resendSuccessMessage.set(null);
    this.resendErrorMessage.set(null);
  }

  onSubmit(): void {
    if (this.activateForm.invalid) {
      this.activateForm.markAllAsTouched();
      return;
    }

    if (!this.token()) {
      this.errorMessage.set('Invalid or missing activation token.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const tokenVal = this.token()!;
    const passwordVal = this.newPassword.value;

    this.authService.activateAccount(tokenVal, passwordVal).subscribe({
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

    const emailVal = this.resendEmail.value;

    this.authService.resendActivationLink(emailVal).subscribe({
      next: (res) => {
        this.isResending.set(false);
        const msg = res.message || 'A new activation link has been sent to your email.';
        this.resendSuccessMessage.set(msg);
        this.toastr.success(msg, 'Email Sent');
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
