import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-pulse space-y-4 w-full">
      @if (type() === 'table') {
        <div class="h-10 bg-slate-200 rounded-t-lg w-full mb-2"></div>
        @for (item of [1,2,3,4,5]; track item) {
          <div class="flex gap-4 p-4 border-b border-slate-100">
            <div class="h-6 bg-slate-200 rounded w-1/4"></div>
            <div class="h-6 bg-slate-200 rounded w-1/4"></div>
            <div class="h-6 bg-slate-200 rounded w-1/4"></div>
            <div class="h-6 bg-slate-200 rounded w-1/4"></div>
          </div>
        }
      } @else if (type() === 'card') {
        <div class="h-48 bg-slate-200 rounded-lg w-full"></div>
      }
    </div>
  `
})
export class SkeletonLoaderComponent {
  type = input<'table' | 'card'>('table');
}
