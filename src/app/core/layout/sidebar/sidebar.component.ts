import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroHome,
  heroArchiveBox,
  heroTag,
  heroScale,
  heroTruck,
  heroShoppingCart,
  heroCurrencyDollar,
  heroChartBar,
  heroUsers,
  heroCog6Tooth,
  heroArrowLeftOnRectangle
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent, NgOptimizedImage],
  viewProviders: [
    provideIcons({
      heroHome, heroArchiveBox, heroTag, heroScale, heroTruck,
      heroShoppingCart, heroCurrencyDollar, heroChartBar,
      heroUsers, heroCog6Tooth, heroArrowLeftOnRectangle
    })
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: []
})
export class SidebarComponent {
  private authService = inject(AuthService);

  isCollapsed = input<boolean>(false);
  isMobileOpen = input<boolean>(false);
  closeMobileSidebar = output<void>();

  menuItems = [
    { label: 'Dashboard', icon: 'heroHome', route: '/dashboard', roles: ['ADMIN', 'STAFF'] },
    { label: 'Products', icon: 'heroArchiveBox', route: '/dashboard/products', roles: ['ADMIN', 'STAFF'] },
    { label: 'Categories', icon: 'heroTag', route: '/dashboard/categories', roles: ['ADMIN', 'STAFF'] },
    { label: 'Units', icon: 'heroScale', route: '/dashboard/units', roles: ['ADMIN', 'STAFF'] },
    { label: 'Suppliers', icon: 'heroTruck', route: '/dashboard/suppliers', roles: ['ADMIN', 'STAFF'] },
    { label: 'Purchases', icon: 'heroShoppingCart', route: '/dashboard/purchases', roles: ['ADMIN', 'STAFF'] },
    { label: 'Sales', icon: 'heroCurrencyDollar', route: '/dashboard/sales', roles: ['ADMIN', 'STAFF'] },
    { label: 'Reports', icon: 'heroChartBar', route: '/dashboard/reports', roles: ['ADMIN'] },
    { label: 'Users', icon: 'heroUsers', route: '/dashboard/users', roles: ['ADMIN'] },
  ];

  filteredMenuItems = computed(() => {
    const user = this.authService.currentUser();
    const userRole = user?.role;
    
    if (!userRole) return [];
    
    return this.menuItems.filter(item => item.roles.includes(userRole));
  });

  onMobileClose(): void {
    this.closeMobileSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
