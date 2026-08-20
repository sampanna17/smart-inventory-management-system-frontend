import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowPath,
  heroPlus,
  heroShoppingCart,
  heroArchiveBox,
  heroTruck,
  heroCalendarDays,
  heroUserPlus,
  heroClock,
  heroShieldCheck,
  heroIdentification
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Role } from '../../../../core/auth/enums/role.enum';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroArrowPath,
      heroPlus,
      heroShoppingCart,
      heroArchiveBox,
      heroTruck,
      heroCalendarDays,
      heroUserPlus,
      heroClock,
      heroShieldCheck,
      heroIdentification
    })
  ],
  templateUrl: './dashboard-header.component.html'
})
export class DashboardHeaderComponent {
  private authService = inject(AuthService);

  readonly Role = Role;

  isRefreshing = input<boolean>(false);
  lastUpdated = input<Date | null>(null);
  refresh = output<void>();

  currentUser = this.authService.currentUser;

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  todayDateFormatted = computed(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date());
  });
}
