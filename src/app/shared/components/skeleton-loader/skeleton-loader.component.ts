import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full animate-pulse">
      
      <!-- 1. TABLE SKELETON: Closely matches real table headers, row heights, badges & pagination -->
      @if (type() === 'table') {
        <div class="w-full rounded-xl overflow-hidden border border-slate-200/80 bg-white shadow-2xs">
          
          <!-- Table Header Strip Skeleton -->
          <div class="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
            <div class="h-3.5 bg-slate-200 rounded w-36"></div>
            <div class="h-3.5 bg-slate-200 rounded w-28 hidden sm:block"></div>
            <div class="h-3.5 bg-slate-200 rounded w-28"></div>
            <div class="h-3.5 bg-slate-200 rounded w-24 hidden md:block"></div>
            <div class="h-3.5 bg-slate-200 rounded w-20"></div>
          </div>

          <!-- Table Rows Skeleton -->
          <div class="divide-y divide-slate-100 bg-white">
            @for (row of getArray(rows()); track $index) {
              <div class="px-6 py-4 flex items-center justify-between gap-4">
                
                <!-- Col 1: Avatar/Thumbnail & Title/Sub -->
                <div class="flex items-center gap-3 min-w-[180px]">
                  <div class="w-10 h-10 rounded-lg bg-slate-200/80 shrink-0"></div>
                  <div class="space-y-1.5 flex-1">
                    <div class="h-3.5 bg-slate-200 rounded w-32"></div>
                    <div class="h-2.5 bg-slate-100 rounded w-20"></div>
                  </div>
                </div>

                <!-- Col 2: Category / Secondary (hidden on mobile) -->
                <div class="hidden sm:block min-w-[100px]">
                  <div class="h-5 bg-slate-200/70 rounded-full w-24"></div>
                </div>

                <!-- Col 3: Price / Currency / Number -->
                <div class="space-y-1 min-w-[90px]">
                  <div class="h-3.5 bg-slate-200 rounded w-24"></div>
                  <div class="h-2.5 bg-slate-100 rounded w-14"></div>
                </div>

                <!-- Col 4: Status / Badge (hidden on smaller screens) -->
                <div class="hidden md:block min-w-[80px]">
                  <div class="h-5 bg-slate-200/70 rounded-full w-20"></div>
                </div>

                <!-- Col 5: Actions (Edit / Delete / View) -->
                <div class="flex items-center gap-2 shrink-0">
                  <div class="w-8 h-8 rounded-lg bg-slate-200/70"></div>
                  <div class="w-8 h-8 rounded-lg bg-slate-200/70"></div>
                </div>

              </div>
            }
          </div>

          <!-- Table Pagination Footer Skeleton -->
          <div class="bg-white px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="h-3.5 bg-slate-200 rounded w-44"></div>
            <div class="flex items-center gap-2">
              <div class="h-8 w-24 bg-slate-200/70 rounded-lg"></div>
              <div class="h-8 w-8 bg-slate-200/70 rounded-lg"></div>
              <div class="h-8 w-8 bg-slate-200/70 rounded-lg"></div>
            </div>
          </div>

        </div>
      }

      <!-- 2. CARD / GRID SKELETON -->
      @else if (type() === 'card' || type() === 'card-grid') {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (item of getArray(rows()); track $index) {
            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div class="h-44 bg-slate-200 rounded-xl w-full"></div>
              <div class="space-y-2">
                <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                <div class="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
              <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                <div class="h-4 bg-slate-200 rounded w-20"></div>
                <div class="h-7 w-16 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- 3. TOP METRICS CARDS SKELETON -->
      @else if (type() === 'metrics') {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (item of [1, 2, 3, 4]; track item) {
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
              <div class="space-y-2 flex-1">
                <div class="h-3 bg-slate-200 rounded w-20"></div>
                <div class="h-6 bg-slate-200 rounded w-28"></div>
              </div>
            </div>
          }
        </div>
      }

    </div>
  `
})
export class SkeletonLoaderComponent {
  type = input<'table' | 'card' | 'card-grid' | 'metrics'>('table');
  rows = input<number>(5);

  getArray(count: number): number[] {
    return Array.from({ length: count || 5 }, (_, i) => i + 1);
  }
}
