import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroCurrencyDollar,
  heroShoppingCart,
  heroTruck,
  heroArchiveBox,
  heroExclamationTriangle,
  heroExclamationCircle,
  heroTag,
  heroUsers,
  heroUserGroup,
  heroBell,
  heroArrowTrendingUp,
  heroArrowRight,
  heroArrowsRightLeft,
  heroCheckBadge
} from '@ng-icons/heroicons/outline';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';

export type KpiVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'slate';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent, NprCurrencyPipe],
  viewProviders: [
    provideIcons({
      heroCurrencyDollar,
      heroShoppingCart,
      heroTruck,
      heroArchiveBox,
      heroExclamationTriangle,
      heroExclamationCircle,
      heroTag,
      heroUsers,
      heroUserGroup,
      heroBell,
      heroArrowTrendingUp,
      heroArrowRight,
      heroArrowsRightLeft,
      heroCheckBadge
    })
  ],
  templateUrl: './kpi-card.component.html'
})
export class KpiCardComponent {
  title = input.required<string>();
  value = input.required<number>();
  icon = input<string>('heroArchiveBox');
  variant = input<KpiVariant>('primary');
  isCurrency = input<boolean>(false);
  subtitle = input<string>('');
  badge = input<string>('');
  badgeType = input<'danger' | 'warning' | 'success' | 'info' | 'neutral'>('neutral');
  alert = input<boolean>(false);
  route = input<string>('');
}
