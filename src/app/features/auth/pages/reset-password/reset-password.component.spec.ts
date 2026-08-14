import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, vi } from 'vitest';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authServiceSpy: {
    resetPassword: ReturnType<typeof vi.fn>;
    resendActivationLink: ReturnType<typeof vi.fn>;
    verifyToken: ReturnType<typeof vi.fn>;
  };
  let toastrSpy: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const setupTestBed = async (queryParams: Record<string, string> = {}) => {
    authServiceSpy = {
      resetPassword: vi.fn(),
      resendActivationLink: vi.fn(),
      verifyToken: vi.fn().mockReturnValue(of({ success: true, message: 'Token is valid' }))
    };
    toastrSpy = {
      success: vi.fn(),
      error: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of(queryParams)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should directly show expired/invalid link state when token is missing', async () => {
    await setupTestBed({});
    expect(component.isTokenExpiredOrInvalid()).toBe(true);
    expect(component.isValidatingToken()).toBe(false);
    expect(component.token()).toBeNull();
    expect(component.errorMessage()).toContain('missing, expired, or invalid');
  });

  it('should verify token and show reset form when valid token is provided in queryParams', async () => {
    await setupTestBed({ token: 'valid-test-token-123' });
    expect(authServiceSpy.verifyToken).toHaveBeenCalledWith('valid-test-token-123');
    expect(component.isValidatingToken()).toBe(false);
    expect(component.isTokenExpiredOrInvalid()).toBe(false);
    expect(component.token()).toBe('valid-test-token-123');
    expect(component.errorMessage()).toBeNull();
  });

  it('should directly show expired link page on load if token verification fails', async () => {
    authServiceSpy = {
      resetPassword: vi.fn(),
      resendActivationLink: vi.fn(),
      verifyToken: vi.fn().mockReturnValue(
        throwError(() => ({ status: 400, error: { message: 'Token has expired' } }))
      )
    };
    toastrSpy = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ token: 'expired-token-xyz' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(authServiceSpy.verifyToken).toHaveBeenCalledWith('expired-token-xyz');
    expect(component.isValidatingToken()).toBe(false);
    expect(component.isTokenExpiredOrInvalid()).toBe(true);
    expect(component.errorMessage()).toBe('Token has expired');
  });

  it('should call authService.resetPassword when form is valid and submitted', async () => {
    await setupTestBed({ token: 'valid-test-token-123' });
    authServiceSpy.resetPassword.mockReturnValue(of({ success: true, message: 'Password reset successful' }));

    component.resetForm.controls.newPassword.setValue('Password123!');
    component.resetForm.controls.confirmPassword.setValue('Password123!');
    fixture.detectChanges();

    component.onSubmit();

    expect(authServiceSpy.resetPassword).toHaveBeenCalledWith('valid-test-token-123', 'Password123!');
    expect(component.isResetSuccess()).toBe(true);
  });

  it('should call authService.resendActivationLink on resend form submission from expired link page', async () => {
    await setupTestBed({});
    authServiceSpy.resendActivationLink.mockReturnValue(
      of({ success: true, message: 'New activation link has been sent.' })
    );

    component.resendForm.controls.email.setValue('user@example.com');
    component.onResendActivationSubmit();

    expect(authServiceSpy.resendActivationLink).toHaveBeenCalledWith('user@example.com');
    expect(component.resendSuccessMessage()).toBe('New activation link has been sent.');
    expect(toastrSpy.success).toHaveBeenCalledWith('New activation link has been sent.', 'Activation Link Sent');
  });
});
