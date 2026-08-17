import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBell,
  heroBellAlert,
  heroCheckCircle,
  heroTrash,
  heroExclamationTriangle,
  heroInformationCircle,
  heroDocumentText,
  heroShoppingCart,
  heroUserPlus,
  heroInbox,
  heroFunnel
} from '@ng-icons/heroicons/outline';
import { NotificationService } from '../../services/notification.service';
import { WebSocketService } from '../../../../core/websocket/websocket.service';
import { NotificationItem, NotificationType } from '../../../../core/models/notification.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
    RelativeTimePipe,
  ],
  viewProviders: [
    provideIcons({
      heroBell,
      heroBellAlert,
      heroCheckCircle,
      heroTrash,
      heroExclamationTriangle,
      heroInformationCircle,
      heroDocumentText,
      heroShoppingCart,
      heroUserPlus,
      heroInbox,
      heroFunnel
    }),
  ],
  templateUrl: './notification-list.component.html',
})
export class NotificationListComponent implements OnInit {
  notificationService = inject(NotificationService);
  private webSocketService = inject(WebSocketService);

  // Filter state
  statusFilter = signal<'all' | 'unread' | 'read'>('all');
  typeFilter = signal<NotificationType | 'all'>('all');

  // Delete confirmation
  isClearAllOpen = signal<boolean>(false);
  isDeleting = signal<boolean>(false);

  // Filtered notifications
  filteredNotifications = computed(() => {
    let list = this.notificationService.notifications();

    // Filter by status
    const status = this.statusFilter();
    if (status === 'unread') {
      list = list.filter(n => !n.isRead);
    } else if (status === 'read') {
      list = list.filter(n => n.isRead);
    }

    // Filter by type
    const type = this.typeFilter();
    if (type !== 'all') {
      list = list.filter(n => n.type === type);
    }

    return list;
  });

  // Summary counts
  totalCount = computed(() => this.notificationService.notifications().length);
  unreadCount = computed(() => this.webSocketService.unreadCount());
  stockAlertCount = computed(() =>
    this.notificationService.notifications().filter(
      n => n.type === 'LOW_STOCK' || n.type === 'OUT_OF_STOCK'
    ).length
  );

  // Type filter options
  typeOptions: { label: string; value: NotificationType | 'all' }[] = [
    { label: 'All Types', value: 'all' },
    { label: 'Low Stock', value: 'LOW_STOCK' },
    { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
    { label: 'Staff Account', value: 'STAFF_ACCOUNT_CREATED' },
    { label: 'Order Placed', value: 'ORDER_PLACED' },
    { label: 'Report', value: 'REPORT' },
    { label: 'General', value: 'GENERAL' },
  ];

  ngOnInit(): void {
    this.notificationService.loadNotifications();
  }

  onStatusFilterChange(status: 'all' | 'unread' | 'read'): void {
    this.statusFilter.set(status);
  }

  onTypeFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as NotificationType | 'all';
    this.typeFilter.set(value);
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  deleteNotification(id: number): void {
    this.notificationService.deleteNotification(id).subscribe();
  }

  openClearAllConfirm(): void {
    this.isClearAllOpen.set(true);
  }

  closeClearAllConfirm(): void {
    this.isClearAllOpen.set(false);
  }

  confirmClearAll(): void {
    this.isDeleting.set(true);
    this.notificationService.deleteAllNotifications().subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.closeClearAllConfirm();
      },
      error: () => {
        this.isDeleting.set(false);
      }
    });
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case 'LOW_STOCK': return 'heroExclamationTriangle';
      case 'OUT_OF_STOCK': return 'heroBellAlert';
      case 'STAFF_ACCOUNT_CREATED': return 'heroUserPlus';
      case 'ORDER_PLACED': return 'heroShoppingCart';
      case 'REPORT': return 'heroDocumentText';
      case 'GENERAL':
      default: return 'heroInformationCircle';
    }
  }

  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case 'LOW_STOCK': return 'text-amber-500 bg-amber-50';
      case 'OUT_OF_STOCK': return 'text-red-500 bg-red-50';
      case 'STAFF_ACCOUNT_CREATED': return 'text-emerald-500 bg-emerald-50';
      case 'ORDER_PLACED': return 'text-blue-500 bg-blue-50';
      case 'REPORT': return 'text-violet-500 bg-violet-50';
      case 'GENERAL':
      default: return 'text-slate-500 bg-slate-100';
    }
  }

  getNotificationBorderColor(type: NotificationType): string {
    switch (type) {
      case 'LOW_STOCK': return 'border-l-amber-400';
      case 'OUT_OF_STOCK': return 'border-l-red-400';
      case 'STAFF_ACCOUNT_CREATED': return 'border-l-emerald-400';
      case 'ORDER_PLACED': return 'border-l-blue-400';
      case 'REPORT': return 'border-l-violet-400';
      case 'GENERAL':
      default: return 'border-l-slate-300';
    }
  }

  getTypeLabel(type: NotificationType): string {
    switch (type) {
      case 'LOW_STOCK': return 'Low Stock';
      case 'OUT_OF_STOCK': return 'Out of Stock';
      case 'STAFF_ACCOUNT_CREATED': return 'Staff Account';
      case 'ORDER_PLACED': return 'Order Placed';
      case 'REPORT': return 'Report';
      case 'GENERAL':
      default: return 'General';
    }
  }

  getTypeBadgeColor(type: NotificationType): string {
    switch (type) {
      case 'LOW_STOCK': return 'bg-amber-100 text-amber-700';
      case 'OUT_OF_STOCK': return 'bg-red-100 text-red-700';
      case 'STAFF_ACCOUNT_CREATED': return 'bg-emerald-100 text-emerald-700';
      case 'ORDER_PLACED': return 'bg-blue-100 text-blue-700';
      case 'REPORT': return 'bg-violet-100 text-violet-700';
      case 'GENERAL':
      default: return 'bg-slate-100 text-slate-600';
    }
  }
}
