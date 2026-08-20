import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroCurrencyDollar,
  heroShoppingCart,
  heroArchiveBox,
  heroExclamationTriangle,
  heroBell,
  heroArrowRight,
  heroCheckCircle,
  heroXCircle,
  heroClock,
  heroExclamationCircle,
  heroShieldCheck,
  heroDocumentText
} from '@ng-icons/heroicons/outline';
import { StaffDashboardResponse } from '../models/dashboard.model';
import { DashboardHeaderComponent } from '../components/dashboard-header/dashboard-header.component';
import { KpiCardComponent } from '../components/kpi-card/kpi-card.component';
import { NprCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { SaleStatus } from '../../sales/models/sale.model';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgIconComponent,
    DashboardHeaderComponent,
    KpiCardComponent,
    NprCurrencyPipe
  ],
  viewProviders: [
    provideIcons({
      heroCurrencyDollar,
      heroShoppingCart,
      heroArchiveBox,
      heroExclamationTriangle,
      heroBell,
      heroArrowRight,
      heroCheckCircle,
      heroXCircle,
      heroClock,
      heroExclamationCircle,
      heroShieldCheck,
      heroDocumentText
    })
  ],
  templateUrl: './staff-dashboard.component.html'
})
export class StaffDashboardComponent {
  data = input.required<StaffDashboardResponse>();
  isRefreshing = input<boolean>(false);
  lastUpdated = input<Date | null>(null);
  refresh = output<void>();

  readonly SaleStatus = SaleStatus;
}
