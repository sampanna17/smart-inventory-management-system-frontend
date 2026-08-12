import { Component, input, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCalendarDays, heroClock } from '@ng-icons/heroicons/outline';

export type DateTimeMode = 'date-time' | 'date-only' | 'time-only' | 'full' | 'short';
export type DateTimeLayout = 'stacked' | 'inline';

@Component({
  selector: 'app-date-time',
  standalone: true,
  imports: [CommonModule, DatePipe, NgIconComponent],
  viewProviders: [provideIcons({ heroCalendarDays, heroClock })],
  template: `
    @if (!date()) {
      <span [class]="fallbackClass()">{{ fallback() }}</span>
    } @else if (mode() === 'date-only') {
      <!-- Date Only -->
      <span class="inline-flex items-center gap-1.5" [class]="dateClass()">
        @if (showIcon()) {
          <ng-icon name="heroCalendarDays" class="text-slate-400 text-sm shrink-0"></ng-icon>
        }
        <span>{{ date() | date:dateFormat() }}</span>
      </span>
    } @else if (mode() === 'time-only') {
      <!-- Time Only -->
      <span class="inline-flex items-center gap-1.5" [class]="timeClass()">
        @if (showIcon()) {
          <ng-icon name="heroClock" class="text-slate-400 text-sm shrink-0"></ng-icon>
        }
        <span>{{ date() | date:timeFormat() }}</span>
      </span>
    } @else if (mode() === 'full') {
      <!-- Full Date & Time -->
      <span class="inline-flex items-center gap-1.5" [class]="dateClass()">
        @if (showIcon()) {
          <ng-icon name="heroCalendarDays" class="text-slate-400 text-sm shrink-0"></ng-icon>
        }
        <span>{{ date() | date:fullFormat() }}</span>
      </span>
    } @else {
      <!-- Date & Time (Stacked or Inline) -->
      @if (layout() === 'inline') {
        <span class="inline-flex items-center gap-1.5 flex-wrap" [class]="dateClass()">
          @if (showIcon()) {
            <ng-icon name="heroCalendarDays" class="text-slate-400 text-sm shrink-0"></ng-icon>
          }
          <span>{{ date() | date:dateFormat() }}</span>
          <span class="text-slate-300">•</span>
          <span [class]="timeClass()">{{ date() | date:timeFormat() }}</span>
        </span>
      } @else {
        <div class="flex flex-col gap-0.5">
          <span [class]="dateClass()">{{ date() | date:dateFormat() }}</span>
          <span [class]="timeClass()">{{ date() | date:timeFormat() }}</span>
        </div>
      }
    }
  `
})
export class DateTimeComponent {
  date = input<string | Date | number | null | undefined>(null);
  mode = input<DateTimeMode>('date-time');
  layout = input<DateTimeLayout>('stacked');
  showIcon = input<boolean>(false);

  dateFormat = input<string>('MMM d, y');
  timeFormat = input<string>('h:mm a');
  fullFormat = input<string>('MMM d, y, h:mm a');

  dateClass = input<string>('text-sm font-medium text-slate-800');
  timeClass = input<string>('text-xs text-slate-400');
  fallbackClass = input<string>('text-sm text-slate-400');
  fallback = input<string>('-');
}
