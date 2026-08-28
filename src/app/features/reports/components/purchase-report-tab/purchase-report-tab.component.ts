import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { SupplierService } from '../../../suppliers/services/supplier.service';
import { PurchaseStatus } from '../../../purchases/models/purchase.model';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroTruck,
  heroCurrencyDollar,
  heroClock,
  heroCheckCircle,
  heroXCircle,
  heroArrowDownTray,
  heroPrinter,
  heroCalendarDays,
  heroBuildingOffice2
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-purchase-report-tab',
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
      heroTruck,
      heroCurrencyDollar,
      heroClock,
      heroCheckCircle,
      heroXCircle,
      heroArrowDownTray,
      heroPrinter,
      heroCalendarDays,
      heroBuildingOffice2
    })
  ],
  templateUrl: './purchase-report-tab.component.html'
})
export class PurchaseReportTabComponent implements OnInit {
  reportService = inject(ReportService);
  supplierService = inject(SupplierService);

  readonly PurchaseStatus = PurchaseStatus;

  // Filter States
  selectedPreset = signal<string>('MONTH');
  selectedStatus = signal<string>('ALL');
  selectedSupplierId = signal<number | null>(null);
  startDate = signal<string>('');
  endDate = signal<string>('');

  // Accessors
  report = computed(() => this.reportService.purchaseReport());
  suppliers = computed(() => this.supplierService.suppliers());
  isLoading = computed(() => this.reportService.isLoading());
  isExporting = computed(() => this.reportService.isExporting());

  ngOnInit() {
    this.supplierService.loadSuppliers();
    this.applyPreset('MONTH');
  }

  applyPreset(preset: string) {
    this.selectedPreset.set(preset);
    const now = new Date();
    let start = new Date();

    if (preset === 'TODAY') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (preset === 'WEEK') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (preset === 'MONTH') {
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

  onFilterChange() {
    this.selectedPreset.set('CUSTOM');
    this.loadReport();
  }

  loadReport() {
    this.reportService.loadPurchaseReport({
      startDate: this.startDate() || undefined,
      endDate: this.endDate() || undefined,
      supplierId: this.selectedSupplierId() || undefined,
      status: this.selectedStatus() as any
    });
  }

  exportCsv() {
    this.reportService.exportPurchaseReport({
      startDate: this.startDate() || undefined,
      endDate: this.endDate() || undefined,
      supplierId: this.selectedSupplierId() || undefined,
      status: this.selectedStatus() as any
    });
  }

  printReport() {
    window.print();
  }
}
