import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroChartBar,
  heroUserGroup,
  heroTag,
  heroCurrencyDollar,
  heroArchiveBox,
  heroPrinter,
  heroCalendarDays
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-analytics-report-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NprCurrencyPipe,
    DateTimeComponent,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      heroChartBar,
      heroUserGroup,
      heroTag,
      heroCurrencyDollar,
      heroArchiveBox,
      heroPrinter,
      heroCalendarDays
    })
  ],
  templateUrl: './analytics-report-tab.component.html'
})
export class AnalyticsReportTabComponent implements OnInit {
  reportService = inject(ReportService);

  // States
  selectedPreset = signal<string>('YEAR');
  startDate = signal<string>('');
  endDate = signal<string>('');

  // Accessors
  productAnalytics = computed(() => this.reportService.productAnalytics());
  customerAnalytics = computed(() => this.reportService.customerAnalytics());
  isLoading = computed(() => this.reportService.isLoading());

  ngOnInit() {
    this.applyPreset('YEAR');
  }

  applyPreset(preset: string) {
    this.selectedPreset.set(preset);
    const now = new Date();
    let start = new Date();

    if (preset === 'MONTH') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (preset === 'YEAR') {
      start = new Date(now.getFullYear(), 0, 1);
    } else if (preset === 'ALL') {
      this.startDate.set('');
      this.endDate.set('');
      this.loadAnalytics();
      return;
    }

    this.startDate.set(start.toISOString().split('T')[0] + 'T00:00:00');
    this.endDate.set(now.toISOString().split('T')[0] + 'T23:59:59');
    this.loadAnalytics();
  }

  loadAnalytics() {
    const params = {
      startDate: this.startDate() || undefined,
      endDate: this.endDate() || undefined,
      limit: 10
    };
    this.reportService.loadProductAnalytics(params);
    this.reportService.loadCustomerAnalytics(params);
  }

  printReport() {
    window.print();
  }
}
