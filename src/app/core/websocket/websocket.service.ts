import { inject, Injectable, PLATFORM_ID, signal, effect, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/services/auth.service';
import { NotificationItem } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  private client: Client | null = null;
  private notificationSubscription: StompSubscription | null = null;
  private isBrowser = isPlatformBrowser(this.platformId);

  // Reactive state signals
  isConnected = signal<boolean>(false);
  unreadCount = signal<number>(0);
  notifications = signal<NotificationItem[]>([]);

  // Observable stream for incoming real-time notifications
  private notificationSubject = new Subject<NotificationItem>();
  notification$ = this.notificationSubject.asObservable();

  constructor() {
    if (!this.isBrowser) return;

    // Reactively connect / disconnect based on current logged in user state
    effect(() => {
      const user = this.authService.currentUser();
      if (user && user.userId) {
        this.connect(user.userId);
      } else {
        this.disconnect();
      }
    });
  }

  /**
   * Initializes and activates the STOMP WebSocket connection using native browser WebSocket.
   */
  connect(userId?: number): void {
    if (!this.isBrowser || this.client?.active) {
      return;
    }

    const currentUserId = userId ?? this.authService.currentUser()?.userId;

    this.client = new Client({
      brokerURL: environment.wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg: string) => {
        if (!environment.production) {
          console.debug('[STOMP WebSocket]', msg);
        }
      }
    });

    this.client.onConnect = () => {
      this.isConnected.set(true);
      if (!environment.production) {
        console.log('[STOMP WebSocket] Connected successfully.');
      }

      // Automatically subscribe to user-specific notifications
      if (currentUserId) {
        this.subscribeToNotifications(currentUserId);
      }
    };

    this.client.onDisconnect = () => {
      this.isConnected.set(false);
      this.notificationSubscription = null;
      if (!environment.production) {
        console.log('[STOMP WebSocket] Disconnected.');
      }
    };

    this.client.onStompError = (frame) => {
      console.error('[STOMP WebSocket Error]', frame.headers['message'], frame.body);
    };

    this.client.activate();
  }

  /**
   * Subscribes to the user-specific notification topic.
   */
  private subscribeToNotifications(userId: number): void {
    if (!this.client || !this.client.connected) {
      return;
    }

    // Clean up existing subscription if any
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
      this.notificationSubscription = null;
    }

    const topic = `/topic/notifications/${userId}`;
    this.notificationSubscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const item: NotificationItem = JSON.parse(message.body);
        this.handleIncomingNotification(item);
      } catch (err) {
        console.error('[STOMP WebSocket] Error parsing notification payload', err);
      }
    });
  }

  /**
   * Generic subscription helper for any STOMP topic.
   */
  subscribeTopic<T>(topic: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      if (!this.client || !this.client.connected) {
        subscriber.error(new Error('WebSocket client is not connected.'));
        return;
      }

      const subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const parsed: T = JSON.parse(message.body);
          subscriber.next(parsed);
        } catch (e) {
          subscriber.error(e);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Handles incoming notification, updates internal signal & shows UI toastr alert.
   */
  private handleIncomingNotification(item: NotificationItem): void {
    this.notifications.update((prev) => [item, ...prev]);
    this.unreadCount.update((count) => count + 1);
    this.notificationSubject.next(item);

    // Trigger toast notification based on type
    switch (item.type) {
      case 'LOW_STOCK':
      case 'OUT_OF_STOCK':
        this.toastr.warning(item.message, item.title, {
          timeOut: 6000,
          closeButton: true,
          progressBar: true
        });
        break;
      case 'STAFF_ACCOUNT_CREATED':
      case 'ORDER_PLACED':
      case 'GENERAL':
      default:
        this.toastr.info(item.message, item.title, {
          timeOut: 5000,
          closeButton: true,
          progressBar: true
        });
        break;
    }
  }

  /**
   * Disconnects and deactivates the STOMP client.
   */
  disconnect(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
      this.notificationSubscription = null;
    }
    if (this.client) {
      void this.client.deactivate();
      this.client = null;
      this.isConnected.set(false);
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
