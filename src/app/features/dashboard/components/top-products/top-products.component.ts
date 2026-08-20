import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroTrophy,
  heroArchiveBox,
  heroArrowRight,
  heroSparkles
} from '@ng-icons/heroicons/outline';
import { TopSellingProduct } from '../../models/dashboard.model';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-top-products',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIconComponent, NprCurrencyPipe],
  viewProviders: [
    provideIcons({
      heroTrophy,
      heroArchiveBox,
      heroArrowRight,
      heroSparkles
    })
  ],
  templateUrl: './top-products.component.html'
})
export class TopProductsComponent {
  products = input<TopSellingProduct[]>([]);

  maxQuantity = computed(() => {
    const list = this.products();
    if (!list || list.length === 0) return 1;
    const max = Math.max(...list.map((p) => Number(p.totalQuantitySold || 0)));
    return max > 0 ? max : 1;
  });

  totalTopRevenue = computed(() => {
    return this.products().reduce((acc, p) => acc + Number(p.totalRevenue || 0), 0);
  });

  getProgressPercent(qty: number): number {
    const q = Number(qty || 0);
    return Math.max(8, (q / this.maxQuantity()) * 100);
  }
}
