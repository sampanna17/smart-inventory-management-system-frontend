import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroShoppingCart,
  heroTruck,
  heroArrowsRightLeft,
  heroArrowRight,
  heroClock,
  heroUser,
  heroCheckCircle,
  heroXCircle,
  heroArrowTrendingUp,
  heroArrowTrendingDown
} from '@ng-icons/heroicons/outline';
import { SaleSummary, SaleStatus } from '../../../sales/models/sale.model';
import { Purchase, PurchaseStatus } from '../../../purchases/models/purchase.model';
import { StockMovement, MovementType } from '../../../stock-movement/models/stock-movement.model';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-recent-activities',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent, NprCurrencyPipe],
  viewProviders: [
    provideIcons({
      heroShoppingCart,
      heroTruck,
      heroArrowsRightLeft,
      heroArrowRight,
      heroClock,
      heroUser,
      heroCheckCircle,
      heroXCircle,
      heroArrowTrendingUp,
      heroArrowTrendingDown
    })
  ],
  templateUrl: './recent-activities.component.html'
})
export class RecentActivitiesComponent {
  recentSales = input<SaleSummary[]>([]);
  recentPurchases = input<Purchase[]>([]);
  recentStockMovements = input<StockMovement[]>([]);

  readonly SaleStatus = SaleStatus;
  readonly PurchaseStatus = PurchaseStatus;
  readonly MovementType = MovementType;

  activeTab = signal<'sales' | 'purchases' | 'movements'>('sales');
}
