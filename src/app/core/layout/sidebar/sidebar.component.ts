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
  heroUserGroup,
  heroUsers,
  heroCog6Tooth,
  heroArrowLeftOnRectangle,
  heroArrowsRightLeft,
  heroBell
} from '@ng-icons/heroicons/outline';
import { Role } from '../../auth/enums/role.enum';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent, NgOptimizedImage],
  viewProviders: [
    provideIcons({
      heroHome,
      heroArchiveBox,
      heroTag,
      heroScale,
      heroTruck,
      heroShoppingCart,
      heroCurrencyDollar,
      heroChartBar,
      heroUserGroup,
      heroUsers,
      heroCog6Tooth,
      heroArrowLeftOnRectangle,
      heroArrowsRightLeft,
      heroBell,
    }),
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: [],
})
export class SidebarComponent {
  private authService = inject(AuthService);

  isCollapsed = input<boolean>(false);
  isMobileOpen = input<boolean>(false);
  closeMobileSidebar = output<void>();

  menuItems = [
    { label: 'Dashboard', icon: 'heroHome', route: '/dashboard', roles: [Role.ADMIN, Role.STAFF] },
    {
      label: 'Products',
      icon: 'heroArchiveBox',
      route: '/dashboard/products',
      roles: [Role.ADMIN, Role.STAFF],
    },
    {
      label: 'Categories',
      icon: 'heroTag',
      route: '/dashboard/categories',
      roles: [Role.ADMIN, Role.STAFF],
    },
    {
      label: 'Units',
      icon: 'heroScale',
      route: '/dashboard/units',
      roles: [Role.ADMIN, Role.STAFF],
    },
    {
      label: 'Suppliers',
      icon: 'heroTruck',
      route: '/dashboard/suppliers',
      roles: [Role.ADMIN, Role.STAFF],
    },
    {
      label: 'Customers',
      icon: 'heroUserGroup',
      route: '/dashboard/customers',
      roles: [Role.ADMIN, Role.STAFF],
    },
    {
      label: 'Purchases',
      icon: 'heroShoppingCart',
      route: '/dashboard/purchases',
      roles: [Role.ADMIN, Role.STAFF],
    },
    {
      label: 'Sales',
      icon: 'heroCurrencyDollar',
      route: '/dashboard/sales',
      roles: [Role.ADMIN, Role.STAFF],
    },
    {
      label: 'Stock Movement',
      icon: 'heroArrowsRightLeft',
      route: '/dashboard/stock-movement',
      roles: [Role.ADMIN, Role.STAFF],
    },
    {
      label: 'Notifications',
      icon: 'heroBell',
      route: '/dashboard/notifications',
      roles: [Role.ADMIN, Role.STAFF],
    },
    {
      label: 'Reports',
      icon: 'heroChartBar',
      route: '/dashboard/reports',
      roles: [Role.ADMIN, Role.STAFF],
    },
    { label: 'Users', icon: 'heroUsers', route: '/dashboard/users', roles: [Role.ADMIN] },
  ];


  filteredMenuItems = computed(() => {
    return this.menuItems.filter((item) => this.authService.hasRole(item.roles));
  });

  onMobileClose(): void {
    this.closeMobileSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
