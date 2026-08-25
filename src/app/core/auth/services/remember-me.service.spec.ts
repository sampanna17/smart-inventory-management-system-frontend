import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { RememberMeService } from './remember-me.service';

describe('RememberMeService', () => {
  let service: RememberMeService;
  const STORAGE_KEY = 'sims_remembered_email';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        RememberMeService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(RememberMeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null when no email is stored', () => {
    expect(service.getRememberedEmail()).toBeNull();
  });

  it('should save and retrieve the remembered email', () => {
    const testEmail = 'user@example.com';
    service.saveRememberedEmail(testEmail);
    expect(service.getRememberedEmail()).toBe(testEmail);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(testEmail);
  });

  it('should trim whitespace when saving email', () => {
    service.saveRememberedEmail('  test@domain.com  ');
    expect(service.getRememberedEmail()).toBe('test@domain.com');
  });

  it('should remove stored email on clearRememberedEmail', () => {
    service.saveRememberedEmail('user@example.com');
    expect(service.getRememberedEmail()).toBe('user@example.com');

    service.clearRememberedEmail();
    expect(service.getRememberedEmail()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should clear storage if empty string is passed to saveRememberedEmail', () => {
    service.saveRememberedEmail('user@example.com');
    service.saveRememberedEmail('   ');
    expect(service.getRememberedEmail()).toBeNull();
  });
});
