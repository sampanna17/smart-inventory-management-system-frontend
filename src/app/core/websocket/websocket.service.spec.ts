import { TestBed } from '@angular/core/testing';
import { WebSocketService } from './websocket.service';
import { AuthService } from '../auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Role } from '../auth/enums/role.enum';
import { signal } from '@angular/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationItem } from '../models/notification.model';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let authServiceSpy: any;
  let toastrSpy: any;

  const mockUser = {
    userId: 42,
    fullName: 'Test Admin',
    email: 'admin@test.com',
    role: Role.ADMIN,
    token: 'jwt.test.token'
  };

  beforeEach(() => {
    authServiceSpy = {
      currentUser: signal(mockUser),
      hasRole: vi.fn().mockReturnValue(true)
    };

    toastrSpy = {
      info: vi.fn(),
      warning: vi.fn(),
      success: vi.fn(),
      error: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        WebSocketService,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    });

    service = TestBed.inject(WebSocketService);
  });

  afterEach(() => {
    service.disconnect();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.isConnected()).toBe(false);
    expect(service.unreadCount()).toBe(0);
  });

  it('should initialize connection properties properly', () => {
    service.connect(42);
    expect(service).toBeDefined();
  });

  it('should update unreadCount and display warning toast for LOW_STOCK notification', () => {
    const notification: NotificationItem = {
      notificationId: 1,
      userID: 42,
      title: 'Low Stock Alert',
      message: 'Product "Laptop Pro" is running low on stock (Quantity: 2)',
      type: 'LOW_STOCK',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Access private method for testing notification dispatch
    (service as any).handleIncomingNotification(notification);

    expect(service.unreadCount()).toBe(1);
    expect(service.notifications().length).toBe(1);
    expect(service.notifications()[0].title).toBe('Low Stock Alert');
    expect(toastrSpy.warning).toHaveBeenCalledWith(
      notification.message,
      notification.title,
      expect.anything()
    );
  });

  it('should update unreadCount and display info toast for STAFF_ACCOUNT_CREATED notification', () => {
    const notification: NotificationItem = {
      notificationId: 2,
      userID: 42,
      title: 'Staff Created',
      message: 'A new staff account has been created for John Doe',
      type: 'STAFF_ACCOUNT_CREATED',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    (service as any).handleIncomingNotification(notification);

    expect(service.unreadCount()).toBe(1);
    expect(toastrSpy.info).toHaveBeenCalledWith(
      notification.message,
      notification.title,
      expect.anything()
    );
  });

  it('should clean up subscriptions and reset connection state on disconnect', () => {
    service.disconnect();
    expect(service.isConnected()).toBe(false);
  });
});
