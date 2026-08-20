import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminDashboardResponse } from '../models/dashboard.model';
import { DashboardHeaderComponent } from '../components/dashboard-header/dashboard-header.component';
import { KpiCardComponent } from '../components/kpi-card/kpi-card.component';
import { SalesRevenueChartComponent } from '../components/sales-revenue-chart/sales-revenue-chart.component';
import { TopProductsComponent } from '../components/top-products/top-products.component';
import { RecentActivitiesComponent } from '../components/recent-activities/recent-activities.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardHeaderComponent,
    KpiCardComponent,
    SalesRevenueChartComponent,
    TopProductsComponent,
    RecentActivitiesComponent
  ],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  data = input.required<AdminDashboardResponse>();
  isRefreshing = input<boolean>(false);
  lastUpdated = input<Date | null>(null);
  refresh = output<void>();
}
