import { Component, inject, signal, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Subscription } from 'rxjs';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroEye, heroEyeSlash, heroArrowLeft, heroUserPlus } from '@ng-icons/heroicons/outline';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { RememberMeService } from '../../../../core/auth/services/remember-me.service';
import { environment } from '../../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgOptimizedImage, NgIconComponent, AuthLayoutComponent],
  viewProviders: [provideIcons({ heroEye, heroEyeSlash, heroArrowLeft, heroUserPlus })],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private rememberMeService = inject(RememberMeService);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private googleCheckInterval: ReturnType<typeof setInterval> | null = null;
  private rememberMeSub: Subscription | null = null;

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

  ngOnInit(): void {
    this.initRememberMe();
  }

  private initRememberMe(): void {
    const rememberedEmail = this.rememberMeService.getRememberedEmail();
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true,
      });
    }

    // Immediately clear stored email whenever user unchecks Remember Me
    this.rememberMeSub = this.loginForm.controls.rememberMe.valueChanges.subscribe((isChecked) => {
      if (!isChecked) {
        this.rememberMeService.clearRememberedEmail();
      }
    });
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

    const { email, password, rememberMe } = this.loginForm.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);

        // Manage Remember Me ONLY after successful authentication
        if (rememberMe) {
          this.rememberMeService.saveRememberedEmail(email);
        } else {
          this.rememberMeService.clearRememberedEmail();
        }

        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);

        let msg = 'Invalid email or password. Please try again.';
        if (err.error && err.error.message) {
          msg = err.error.message;
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

  ngOnDestroy(): void {
    if (this.rememberMeSub) {
      this.rememberMeSub.unsubscribe();
      this.rememberMeSub = null;
    }
    if (this.googleCheckInterval) {
      clearInterval(this.googleCheckInterval);
      this.googleCheckInterval = null;
    }
  }

  private renderGoogleButton(): void {
    // Robustly wait for the Google library to load to prevent race conditions on reload
    let attempts = 0;
    const maxAttempts = 100; // Stop polling after 5 seconds

    this.googleCheckInterval = setInterval(() => {
      attempts++;
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        if (this.googleCheckInterval) {
          clearInterval(this.googleCheckInterval);
          this.googleCheckInterval = null;
        }
        this.initializeGoogle();
      } else if (attempts >= maxAttempts) {
        if (this.googleCheckInterval) {
          clearInterval(this.googleCheckInterval);
          this.googleCheckInterval = null;
        }
      }
    }, 50);
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
        { theme: 'outline', size: 'large', type: 'standard', shape: 'rectangular', text: 'signin_with', width: '600' }
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

