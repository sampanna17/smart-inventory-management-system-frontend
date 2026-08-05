import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroExclamationTriangle, heroArrowPath } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ heroExclamationTriangle, heroArrowPath })],
  template: `
    <div class="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-red-200">
      <div class="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
        <ng-icon name="heroExclamationTriangle" class="text-3xl text-red-500"></ng-icon>
      </div>
      <h3 class="text-lg font-medium text-slate-900 mb-1">{{ title() }}</h3>
      <p class="text-sm text-slate-500 max-w-sm mb-6">{{ message() }}</p>
      
      <button
        (click)="retry.emit()"
        class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors shadow-sm"
      >
        <ng-icon name="heroArrowPath" class="text-lg"></ng-icon>
        {{ retryLabel() }}
      </button>
    </div>
  `
})
export class ErrorStateComponent {
  title = input<string>('Something went wrong');
  message = input<string>('We encountered an error while loading the data. Please try again.');
  retryLabel = input<string>('Retry');
  retry = output<void>();
}
