import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../core/models/api-response.model';
import { NotificationItem } from '../../../core/models/notification.model';
import { NOTIFICATION_API } from '../constants/notification.api';
import { WebSocketService } from '../../../core/websocket/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private webSocketService = inject(WebSocketService);

  // State signals
  notifications = signal<NotificationItem[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  /**
   * Loads all notifications for the current user from the REST API.
   * Also syncs the unread count signal.
   */
  loadNotifications(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse<NotificationItem[]>>(NOTIFICATION_API.GET_ALL)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load notifications');
          return throwError(() => err);
        })
      )
      .subscribe(res => {
        if (res.success && res.data) {
          this.notifications.set(res.data);
          // Sync WebSocket unread count from server truth
          const unread = res.data.filter(n => !n.isRead).length;
          this.webSocketService.unreadCount.set(unread);
          // Sync websocket notifications signal
          this.webSocketService.notifications.set(res.data);
        }
      });
  }

  /**
   * Loads the unread count from the backend (used on app init).
   */
  loadUnreadCount(): void {
    this.http.get<ApiResponse<number>>(NOTIFICATION_API.UNREAD_COUNT)
      .pipe(
        catchError(() => {
          return throwError(() => new Error('Failed to load unread count'));
        })
      )
      .subscribe(res => {
        if (res.success && res.data !== undefined) {
          this.webSocketService.unreadCount.set(res.data);
        }
      });
  }

  /**
   * Marks a single notification as read.
   */
  markAsRead(notificationId: number): Observable<ApiResponse<NotificationItem>> {
    return this.http.patch<ApiResponse<NotificationItem>>(
      NOTIFICATION_API.MARK_AS_READ(notificationId), {}
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          // Update local state
          this.notifications.update(list =>
            list.map(n => n.notificationID === notificationId ? { ...n, isRead: true } : n)
          );
          this.webSocketService.notifications.update(list =>
            list.map(n => n.notificationID === notificationId ? { ...n, isRead: true } : n)
          );
          this.webSocketService.unreadCount.update(c => Math.max(0, c - 1));
        }
      }),
      catchError(err => {
        this.toastr.error(err.error?.message || 'Failed to mark notification as read');
        return throwError(() => err);
      })
    );
  }

  /**
   * Marks all notifications as read.
   */
  markAllAsRead(): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      NOTIFICATION_API.MARK_ALL_AS_READ, {}
    ).pipe(
      tap(res => {
        if (res.success) {
          this.notifications.update(list =>
            list.map(n => ({ ...n, isRead: true }))
          );
          this.webSocketService.notifications.update(list =>
            list.map(n => ({ ...n, isRead: true }))
          );
          this.webSocketService.unreadCount.set(0);
          this.toastr.success('All notifications marked as read');
        }
      }),
      catchError(err => {
        this.toastr.error(err.error?.message || 'Failed to mark all as read');
        return throwError(() => err);
      })
    );
  }

  /**
   * Deletes a single notification.
   */
  deleteNotification(notificationId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      NOTIFICATION_API.DELETE(notificationId)
    ).pipe(
      tap(res => {
        if (res.success) {
          const deletedItem = this.notifications().find(n => n.notificationID === notificationId);
          this.notifications.update(list =>
            list.filter(n => n.notificationID !== notificationId)
          );
          this.webSocketService.notifications.update(list =>
            list.filter(n => n.notificationID !== notificationId)
          );
          // Decrement unread count if the deleted notification was unread
          if (deletedItem && !deletedItem.isRead) {
            this.webSocketService.unreadCount.update(c => Math.max(0, c - 1));
          }
        }
      }),
      catchError(err => {
        this.toastr.error(err.error?.message || 'Failed to delete notification');
        return throwError(() => err);
      })
    );
  }

  /**
   * Deletes all notifications for the current user.
   */
  deleteAllNotifications(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(NOTIFICATION_API.DELETE_ALL).pipe(
      tap(res => {
        if (res.success) {
          this.notifications.set([]);
          this.webSocketService.notifications.set([]);
          this.webSocketService.unreadCount.set(0);
          this.toastr.success('All notifications cleared');
        }
      }),
      catchError(err => {
        this.toastr.error(err.error?.message || 'Failed to delete all notifications');
        return throwError(() => err);
      })
    );
  }
}
