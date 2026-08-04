import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgOptimizedImage, AuthLayoutComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: []
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get email() {
    return this.forgotForm.controls.email;
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const emailValue = this.email.value;

    this.authService.forgotPassword(emailValue).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastr.success(
          'Password reset link sent successfully. Please check your email.',
          'Success',
        );
        void this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Forgot password error', err);

        let msg = 'Failed to send reset link. Please try again.';
        if (err.error && err.error.message) {
          msg = err.error.message;
        }
        this.errorMessage.set(msg);
      }
    });
  }
}
