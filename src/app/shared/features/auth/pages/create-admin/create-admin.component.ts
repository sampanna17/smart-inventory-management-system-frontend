import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroEye, heroEyeSlash } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-create-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgOptimizedImage, NgIconComponent],
  viewProviders: [provideIcons({ heroEye, heroEyeSlash })],
  templateUrl: './create-admin.component.html',
  styleUrls: [],
})
export class CreateAdminComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  isLoading = signal(false);
  hidePassword = signal(true);

  togglePassword(): void {
    this.hidePassword.update(value => !value);
  }

  adminForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['admin'] // Setting default role to admin for the signup payload
  });

  get name() {
    return this.adminForm.controls.name;
  }

  get email() {
    return this.adminForm.controls.email;
  }

  get password() {
    return this.adminForm.controls.password;
  }

  onSubmit(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      this.toastr.warning('Please fill out all required fields correctly.', 'Validation Error');
      return;
    }

    this.isLoading.set(true);

    const userData = this.adminForm.getRawValue();

    this.authService.createAdmin(userData)
      .pipe(
        catchError(error => {
          console.error('Signup Error:', error);
          
          let errorMsg = 'Failed to create admin. Please try again.';
          
          if (error.status === 0) {
            errorMsg = 'Network error. Is the backend running? (Check CORS too)';
          } else if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error?.message) {
            errorMsg = error.error.message;
          } else if (error.error?.detail) {
            errorMsg = error.error.detail;
          } else if (error.message) {
            errorMsg = error.message;
          }

          this.toastr.error(errorMsg, 'Error');
          this.isLoading.set(false);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.toastr.success('Admin created successfully! Redirecting...', 'Success');
          this.isLoading.set(false);
          this.adminForm.reset();
          
          setTimeout(() => {
            void this.router.navigate(['/auth/login']);
          }, 2000);
        }
      });
  }
}
