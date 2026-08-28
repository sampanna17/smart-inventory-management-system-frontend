import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroUsers,
  heroCurrencyDollar,
  heroShoppingCart,
  heroArchiveBox,
  heroPrinter,
  heroCalendarDays,
  heroCheckBadge
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-staff-report-tab',
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
      heroUsers,
      heroCurrencyDollar,
      heroShoppingCart,
      heroArchiveBox,
      heroPrinter,
      heroCalendarDays,
      heroCheckBadge
    })
  ],
  templateUrl: './staff-report-tab.component.html'
})
export class StaffReportTabComponent implements OnInit {
  reportService = inject(ReportService);

  // States
  selectedPreset = signal<string>('MONTH');
  startDate = signal<string>('');
  endDate = signal<string>('');

  // Accessors
  report = computed(() => this.reportService.staffReport());
  isLoading = computed(() => this.reportService.isLoading());

  ngOnInit() {
    this.applyPreset('MONTH');
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
      this.loadReport();
      return;
    }

    this.startDate.set(start.toISOString().split('T')[0] + 'T00:00:00');
    this.endDate.set(now.toISOString().split('T')[0] + 'T23:59:59');
    this.loadReport();
  }

  loadReport() {
    this.reportService.loadStaffReport({
      startDate: this.startDate() || undefined,
      endDate: this.endDate() || undefined
    });
  }

  printReport() {
    window.print();
  }
}
