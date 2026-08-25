import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { RememberMeService } from '../../../../core/auth/services/remember-me.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PLATFORM_ID } from '@angular/core';

describe('LoginComponent - Remember Me Flow', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: {
    login: ReturnType<typeof vi.fn>;
    loginWithGoogle: ReturnType<typeof vi.fn>;
  };
  let rememberMeService: RememberMeService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    authServiceSpy = {
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
        RememberMeService,
      ],
    }).compileComponents();

    rememberMeService = TestBed.inject(RememberMeService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize empty when no remembered email exists', () => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.loginForm.controls.email.value).toBe('');
    expect(component.loginForm.controls.password.value).toBe('');
    expect(component.loginForm.controls.rememberMe.value).toBe(false);
  });

  it('should prefill email and check rememberMe when remembered email exists (Scenario 2 & 4)', () => {
    rememberMeService.saveRememberedEmail('remembered@domain.com');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.loginForm.controls.email.value).toBe('remembered@domain.com');
    expect(component.loginForm.controls.password.value).toBe('');
    expect(component.loginForm.controls.rememberMe.value).toBe(true);
  });

  it('should save email on successful login with rememberMe checked (Scenario 1)', () => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    authServiceSpy.login.mockReturnValue(of({ success: true, data: { email: 'admin@sims.com' } }));

    component.loginForm.setValue({
      email: 'admin@sims.com',
      password: 'SecurePassword123!',
      rememberMe: true,
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'admin@sims.com',
      password: 'SecurePassword123!',
    });
    expect(rememberMeService.getRememberedEmail()).toBe('admin@sims.com');
    expect(localStorage.getItem('sims_remembered_email')).toBe('admin@sims.com');
    expect(localStorage.getItem('password')).toBeNull();
  });

  it('should clear stored email on successful login with rememberMe unchecked (Scenario 3)', () => {
    rememberMeService.saveRememberedEmail('olduser@sims.com');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    authServiceSpy.login.mockReturnValue(of({ success: true, data: { email: 'newuser@sims.com' } }));

    component.loginForm.setValue({
      email: 'newuser@sims.com',
      password: 'SecurePassword123!',
      rememberMe: false,
    });

    component.onSubmit();

    expect(rememberMeService.getRememberedEmail()).toBeNull();
  });

  it('should immediately remove remembered email when user manually unchecks rememberMe (Scenario 5)', () => {
    rememberMeService.saveRememberedEmail('activeuser@sims.com');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.loginForm.controls.rememberMe.value).toBe(true);
    expect(rememberMeService.getRememberedEmail()).toBe('activeuser@sims.com');

    // User unchecks the box
    component.loginForm.controls.rememberMe.setValue(false);

    expect(rememberMeService.getRememberedEmail()).toBeNull();
    expect(localStorage.getItem('sims_remembered_email')).toBeNull();
  });

  it('should not persist unverified email if login fails (Scenario 9)', () => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    authServiceSpy.login.mockReturnValue(
      throwError(() => ({ status: 401, error: { message: 'Invalid credentials' } }))
    );

    component.loginForm.setValue({
      email: 'hacker@unknown.com',
      password: 'WrongPassword!',
      rememberMe: true,
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Invalid credentials');
    expect(rememberMeService.getRememberedEmail()).toBeNull();
  });
});
