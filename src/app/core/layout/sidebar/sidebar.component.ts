import { Component, input, output, inject } from '@angular/core';
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
    { label: 'Dashboard', icon: 'heroHome', route: '/dashboard' },
    { label: 'Products', icon: 'heroArchiveBox', route: '/dashboard/products' },
    { label: 'Categories', icon: 'heroTag', route: '/dashboard/categories' },
    { label: 'Units', icon: 'heroScale', route: '/dashboard/units' },
    { label: 'Suppliers', icon: 'heroTruck', route: '/dashboard/suppliers' },
    { label: 'Purchases', icon: 'heroShoppingCart', route: '/dashboard/purchases' },
    { label: 'Sales', icon: 'heroCurrencyDollar', route: '/dashboard/sales' },
    { label: 'Reports', icon: 'heroChartBar', route: '/dashboard/reports' },
    { label: 'Users', icon: 'heroUsers', route: '/dashboard/users' },
  ];

  onMobileClose(): void {
    this.closeMobileSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
