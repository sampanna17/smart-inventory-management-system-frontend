import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBars3,
  heroMagnifyingGlass,
  heroBell,
  heroChevronDown,
  heroUser
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../auth/services/auth.service';
import { WebSocketService } from '../../websocket/websocket.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent],
  viewProviders: [
    provideIcons({ heroBars3, heroMagnifyingGlass, heroBell, heroChevronDown, heroUser })
  ],
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent {
  toggleSidebar = output<void>();
  private authService = inject(AuthService);
  private webSocketService = inject(WebSocketService);

  currentUser = this.authService.currentUser;
  unreadCount = this.webSocketService.unreadCount;
  isSocketConnected = this.webSocketService.isConnected;

  onToggle(): void {
    this.toggleSidebar.emit();
  }
}
