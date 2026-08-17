import { Component, output, inject, signal, OnInit, HostListener, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBars3,
  heroMagnifyingGlass,
  heroBell,
  heroChevronDown,
  heroUser,
  heroXMark,
  heroTrash,
  heroCheckCircle,
  heroExclamationTriangle,
  heroInformationCircle,
  heroDocumentText,
  heroShoppingCart,
  heroUserPlus,
  heroBellAlert
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../auth/services/auth.service';
import { WebSocketService } from '../../websocket/websocket.service';
import { NotificationService } from '../../../features/notifications/services/notification.service';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { NotificationType } from '../../models/notification.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent, RelativeTimePipe],
  viewProviders: [
    provideIcons({
      heroBars3, heroMagnifyingGlass, heroBell, heroChevronDown, heroUser,
      heroXMark, heroTrash, heroCheckCircle, heroExclamationTriangle,
      heroInformationCircle, heroDocumentText, heroShoppingCart, heroUserPlus,
      heroBellAlert
    })
  ],
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent implements OnInit {
  toggleSidebar = output<void>();
  private authService = inject(AuthService);
  private webSocketService = inject(WebSocketService);
  private notificationService = inject(NotificationService);
  private elementRef = inject(ElementRef);

  currentUser = this.authService.currentUser;
  unreadCount = this.webSocketService.unreadCount;
  isSocketConnected = this.webSocketService.isConnected;
  isDropdownOpen = signal<boolean>(false);

  // Show latest 10 notifications in dropdown
  dropdownNotifications = computed(() =>
    this.notificationService.notifications().slice(0, 10)
  );
  isLoading = this.notificationService.isLoading;

  ngOnInit(): void {
    this.notificationService.loadUnreadCount();
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }

  toggleDropdown(): void {
    const opening = !this.isDropdownOpen();
    this.isDropdownOpen.set(opening);
    if (opening) {
      this.notificationService.loadNotifications();
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isDropdownOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeDropdown();
  }

  markAsRead(notificationId: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(notificationId).subscribe();
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe();
  }

  deleteNotification(notificationId: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId).subscribe();
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
}
