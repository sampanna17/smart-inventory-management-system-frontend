import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { SaleStatus } from '../../../sales/models/sale.model';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroCurrencyDollar,
  heroShoppingCart,
  heroArchiveBox,
  heroArrowTrendingUp,
  heroArrowDownTray,
  heroPrinter,
  heroCalendarDays,
  heroCheckCircle,
  heroXCircle,
  heroArrowPath,
  heroFunnel
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-sales-report-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NprCurrencyPipe,
    DateTimeComponent,
    EmptyStateComponent,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      heroCurrencyDollar,
      heroShoppingCart,
      heroArchiveBox,
      heroArrowTrendingUp,
      heroArrowDownTray,
      heroPrinter,
      heroCalendarDays,
      heroCheckCircle,
      heroXCircle,
      heroArrowPath,
      heroFunnel
    })
  ],
  templateUrl: './sales-report-tab.component.html'
})
export class SalesReportTabComponent implements OnInit {
  reportService = inject(ReportService);

  readonly SaleStatus = SaleStatus;

  // Filter States
  selectedPreset = signal<string>('MONTH');
  selectedStatus = signal<string>('ALL');
  groupBy = signal<'DAY' | 'MONTH' | 'YEAR'>('DAY');
  startDate = signal<string>('');
  endDate = signal<string>('');

  // Accessors
  report = computed(() => this.reportService.salesReport());
  isLoading = computed(() => this.reportService.isLoading());
  isExporting = computed(() => this.reportService.isExporting());

  chartPoints = computed(() => this.report()?.periodBreakdown || []);

  maxChartRevenue = computed(() => {
    const points = this.chartPoints();
    if (!points.length) return 1;
    const max = Math.max(...points.map(p => p.revenue || 0));
    return max > 0 ? max : 1;
  });

  ngOnInit() {
    this.applyPreset('MONTH');
  }

  applyPreset(preset: string) {
    this.selectedPreset.set(preset);
    const now = new Date();
    let start = new Date();

    if (preset === 'TODAY') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      this.groupBy.set('DAY');
    } else if (preset === 'WEEK') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      this.groupBy.set('DAY');
    } else if (preset === 'MONTH') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      this.groupBy.set('DAY');
    } else if (preset === 'YEAR') {
      start = new Date(now.getFullYear(), 0, 1);
      this.groupBy.set('MONTH');
    } else if (preset === 'ALL') {
      this.startDate.set('');
      this.endDate.set('');
      this.groupBy.set('MONTH');
      this.loadReport();
      return;
    }

    this.startDate.set(start.toISOString().split('T')[0] + 'T00:00:00');
    this.endDate.set(now.toISOString().split('T')[0] + 'T23:59:59');
    this.loadReport();
  }

  onFilterChange() {
    this.selectedPreset.set('CUSTOM');
    this.loadReport();
  }

  loadReport() {
    this.reportService.loadSalesReport({
      startDate: this.startDate() || undefined,
      endDate: this.endDate() || undefined,
      status: this.selectedStatus() as any,
      groupBy: this.groupBy()
    });
  }

  exportCsv() {
    this.reportService.exportSalesReport({
      startDate: this.startDate() || undefined,
      endDate: this.endDate() || undefined,
      status: this.selectedStatus() as any,
      groupBy: this.groupBy()
    });
  }

  printReport() {
    window.print();
  }

  getBarHeight(revenue: number): number {
    if (!revenue || revenue === 0) return 4;
    return Math.max(8, (revenue / this.maxChartRevenue()) * 100);
  }
}
