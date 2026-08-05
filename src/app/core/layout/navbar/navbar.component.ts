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
  currentUser = this.authService.currentUser;

  onToggle(): void {
    this.toggleSidebar.emit();
  }
}
