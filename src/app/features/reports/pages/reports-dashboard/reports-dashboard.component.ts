import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Role } from '../../../../core/auth/enums/role.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SalesReportTabComponent } from '../../components/sales-report-tab/sales-report-tab.component';
import { InventoryReportTabComponent } from '../../components/inventory-report-tab/inventory-report-tab.component';
import { PurchaseReportTabComponent } from '../../components/purchase-report-tab/purchase-report-tab.component';
import { AnalyticsReportTabComponent } from '../../components/analytics-report-tab/analytics-report-tab.component';
import { StaffReportTabComponent } from '../../components/staff-report-tab/staff-report-tab.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroChartBar,
  heroCurrencyDollar,
  heroArchiveBox,
  heroTruck,
  heroUsers
} from '@ng-icons/heroicons/outline';

export type ReportTab = 'sales' | 'inventory' | 'purchases' | 'analytics' | 'staff';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    SalesReportTabComponent,
    InventoryReportTabComponent,
    PurchaseReportTabComponent,
    AnalyticsReportTabComponent,
    StaffReportTabComponent,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      heroChartBar,
      heroCurrencyDollar,
      heroArchiveBox,
      heroTruck,
      heroUsers
    })
  ],
  templateUrl: './reports-dashboard.component.html'
})
export class ReportsDashboardComponent {
  private authService = inject(AuthService);

  readonly Role = Role;
  isAdmin = computed(() => this.authService.hasRole(Role.ADMIN));

  activeTab = signal<ReportTab>('sales');

  tabs = computed(() => {
    const list: { id: ReportTab; label: string; icon: string; adminOnly?: boolean }[] = [
      { id: 'sales', label: 'Sales Reports', icon: 'heroCurrencyDollar' },
      { id: 'inventory', label: 'Inventory & Valuation', icon: 'heroArchiveBox' },
    ];

    if (this.isAdmin()) {
      list.push(
        { id: 'purchases', label: 'Purchase Orders', icon: 'heroTruck', adminOnly: true },
        { id: 'analytics', label: 'Customer & Product Analytics', icon: 'heroChartBar', adminOnly: true },
        { id: 'staff', label: 'Staff Performance', icon: 'heroUsers', adminOnly: true }
      );
    }

    return list;
  });

  setTab(tab: ReportTab) {
    this.activeTab.set(tab);
  }
}
