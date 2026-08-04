import { Component, inject, signal, AfterViewInit, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroEye, heroEyeSlash } from '@ng-icons/heroicons/outline';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { environment } from '../../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgOptimizedImage, NgIconComponent, AuthLayoutComponent],
  viewProviders: [provideIcons({ heroEye, heroEyeSlash })],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  isLoading = signal(false);
  hidePassword = signal(true);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  togglePassword(): void {
    this.hidePassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Login error', err);

        let msg = 'Invalid email or password. Please try again.';
        if (err.error && err.error.message) {
          msg = err.error.message;
          // If the backend returns detailed errors in a list, you can append them
          if (err.error.errors && err.error.errors.length > 0) {
            msg += ': ' + err.error.errors.join(', ');
          }
        }

        this.errorMessage.set(msg);
      }
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.renderGoogleButton();
    }
  }

  private renderGoogleButton(): void {
    if (typeof google !== 'undefined') {
      this.initializeGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.initializeGoogle();
      };
      document.body.appendChild(script);
    }
  }

  private initializeGoogle(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        this.ngZone.run(() => this.handleGoogleLogin(response));
      }
    });
    
    const container = document.getElementById('google-btn-container');
    if (container) {
      google.accounts.id.renderButton(
        container,
        { theme: 'outline', size: 'medium', shape: 'rectangular', text: 'signin_with' }
      );
    }
  }

  handleGoogleLogin(response: any): void {
    if (response.credential) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: () => {
          this.isLoading.set(false);
          void this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Google Login error', err);
          let msg = 'Google login failed. Please try again.';
          if (err.error && err.error.message) {
            msg = err.error.message;
          }
          this.errorMessage.set(msg);
        }
      });
    }
  }
}
