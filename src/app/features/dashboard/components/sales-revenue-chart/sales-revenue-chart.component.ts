import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroChartBar,
  heroCurrencyDollar,
  heroShoppingCart,
  heroCalendarDays,
  heroArrowTrendingUp
} from '@ng-icons/heroicons/outline';
import { TrendDataPoint } from '../../models/dashboard.model';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-sales-revenue-chart',
  standalone: true,
  imports: [CommonModule, NgIconComponent, NprCurrencyPipe],
  viewProviders: [
    provideIcons({
      heroChartBar,
      heroCurrencyDollar,
      heroShoppingCart,
      heroCalendarDays,
      heroArrowTrendingUp
    })
  ],
  templateUrl: './sales-revenue-chart.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, 4px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.15s ease-out forwards;
    }
  `]
})
export class SalesRevenueChartComponent {
  salesTrend = input<TrendDataPoint[]>([]);
  revenueTrend = input<TrendDataPoint[]>([]);

  activeMode = signal<'revenue' | 'orders'>('revenue');
  hoveredIndex = signal<number | null>(null);

  chartPoints = computed(() => {
    return this.salesTrend() || [];
  });

  maxAmount = computed(() => {
    const points = this.chartPoints();
    if (!points || points.length === 0) return 1;
    const max = Math.max(...points.map((p) => Number(p.amount || 0)));
    return max > 0 ? max : 1;
  });

  maxCount = computed(() => {
    const points = this.chartPoints();
    if (!points || points.length === 0) return 1;
    const max = Math.max(...points.map((p) => Number(p.count || 0)));
    return max > 0 ? max : 1;
  });

  total7DayRevenue = computed(() => {
    return this.chartPoints().reduce((acc, p) => acc + Number(p.amount || 0), 0);
  });

  total7DayOrders = computed(() => {
    return this.chartPoints().reduce((acc, p) => acc + Number(p.count || 0), 0);
  });

  dailyAverage = computed(() => {
    const count = this.chartPoints().length || 7;
    return this.total7DayRevenue() / count;
  });

  getBarHeightPercent(point: TrendDataPoint): number {
    if (this.activeMode() === 'revenue') {
      const amt = Number(point.amount || 0);
      if (amt === 0) return 4; // Minimum visible nub
      return Math.max(8, (amt / this.maxAmount()) * 100);
    } else {
      const cnt = Number(point.count || 0);
      if (cnt === 0) return 4;
      return Math.max(8, (cnt / this.maxCount()) * 100);
    }
  }

  formatDayName(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return '';
    }
  }

  formatShortDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  formatFullDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
}
