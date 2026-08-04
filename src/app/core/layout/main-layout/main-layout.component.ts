import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: []
})
export class MainLayoutComponent {
  isSidebarCollapsed = signal(false);
  isMobileSidebarOpen = signal(false);

  toggleSidebar(): void {
    if (window.innerWidth >= 1024) {
      // Desktop
      this.isSidebarCollapsed.update(val => !val);
    } else {
      // Mobile
      this.isMobileSidebarOpen.update(val => !val);
    }
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }
}
