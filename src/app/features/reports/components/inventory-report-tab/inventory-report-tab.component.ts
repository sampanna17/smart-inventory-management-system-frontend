import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { CategoryService } from '../../../categories/services/category.service';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArchiveBox,
  heroCurrencyDollar,
  heroBanknotes,
  heroArrowTrendingUp,
  heroExclamationTriangle,
  heroXCircle,
  heroArrowDownTray,
  heroPrinter,
  heroArrowsRightLeft,
  heroMagnifyingGlass
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-inventory-report-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NprCurrencyPipe,
    EmptyStateComponent,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      heroArchiveBox,
      heroCurrencyDollar,
      heroBanknotes,
      heroArrowTrendingUp,
      heroExclamationTriangle,
      heroXCircle,
      heroArrowDownTray,
      heroPrinter,
      heroArrowsRightLeft,
      heroMagnifyingGlass
    })
  ],
  templateUrl: './inventory-report-tab.component.html'
})
export class InventoryReportTabComponent implements OnInit {
  reportService = inject(ReportService);
  categoryService = inject(CategoryService);

  // Filters
  selectedCategoryId = signal<number | null>(null);
  selectedStockStatus = signal<string>('ALL');
  searchQuery = signal<string>('');

  // Accessors
  report = computed(() => this.reportService.inventoryReport());
  categories = computed(() => this.categoryService.categories());
  isLoading = computed(() => this.reportService.isLoading());
  isExporting = computed(() => this.reportService.isExporting());

  ngOnInit() {
    this.categoryService.loadCategories();
    this.loadReport();
  }

  loadReport() {
    this.reportService.loadInventoryReport({
      categoryId: this.selectedCategoryId() || undefined,
      stockStatus: this.selectedStockStatus() as any,
      search: this.searchQuery() || undefined
    });
  }

  onFilterChange() {
    this.loadReport();
  }

  exportCsv() {
    this.reportService.exportInventoryReport({
      categoryId: this.selectedCategoryId() || undefined,
      stockStatus: this.selectedStockStatus() as any,
      search: this.searchQuery() || undefined
    });
  }

  printReport() {
    window.print();
  }
}
