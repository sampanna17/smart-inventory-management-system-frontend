import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleService } from '../../services/sale.service';
import { SaleSummary, SaleDetail, SaleStatus } from '../../models/sale.model';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroXMark,
  heroPrinter,
  heroCheckCircle,
  heroXCircle,
  heroArrowPath,
  heroUser,
  heroCalendar,
  heroDocumentText
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-sale-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    NprCurrencyPipe,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      heroXMark,
      heroPrinter,
      heroCheckCircle,
      heroXCircle,
      heroArrowPath,
      heroUser,
      heroCalendar,
      heroDocumentText
    })
  ],
  templateUrl: './sale-detail-modal.component.html'
})
export class SaleDetailModalComponent {
  private saleService = inject(SaleService);

  isOpen = input<boolean>(false);
  saleSummary = input<SaleSummary | null>(null);

  close = output<void>();
  statusChange = output<{ id: number; status: SaleStatus }>();

  saleDetail = signal<SaleDetail | null>(null);
  isLoadingDetail = signal<boolean>(false);

  readonly SaleStatus = SaleStatus;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const summary = this.saleSummary();
      if (open && summary) {
        this.fetchSaleDetail(summary.saleId);
      } else {
        this.saleDetail.set(null);
      }
    });
  }

  private fetchSaleDetail(saleId: number) {
    this.isLoadingDetail.set(true);
    this.saleService.getSaleById(saleId).subscribe({
      next: res => {
        this.isLoadingDetail.set(false);
        if (res.success && res.data) {
          this.saleDetail.set(res.data);
        }
      },
      error: () => {
        this.isLoadingDetail.set(false);
      }
    });
  }

  closeModal() {
    this.close.emit();
  }

  onUpdateStatus(status: SaleStatus) {
    const sale = this.saleDetail() || this.saleSummary();
    if (sale) {
      this.statusChange.emit({ id: sale.saleId, status });
    }
  }

  printInvoice() {
    window.print();
  }
}
