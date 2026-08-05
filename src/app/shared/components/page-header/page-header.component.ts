import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPlus } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ heroPlus })],
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="mt-1 text-sm text-slate-500">{{ subtitle() }}</p>
        }
      </div>

      @if (showAction()) {
        <button
          (click)="action.emit()"
          class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md shadow-sm transition-colors"
        >
          <ng-icon [name]="actionIcon()" class="text-lg"></ng-icon>
          {{ actionLabel() }}
        </button>
      }
    </div>
  `
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  showAction = input<boolean>(false);
  actionLabel = input<string>('Add New');
  actionIcon = input<string>('heroPlus');
  action = output<void>();
}
