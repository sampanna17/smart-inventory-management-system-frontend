import { Component, ElementRef, forwardRef, signal, computed, input } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCalendarDays, heroClock, heroCheck } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    OverlayModule,
    NgIconComponent
  ],
  providers: [
    provideNativeDateAdapter(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDateTimePickerComponent),
      multi: true
    }
  ],
  viewProviders: [provideIcons({ heroCalendarDays, heroClock, heroCheck })],
  templateUrl: './custom-date-picker.component.html',
  styles: [`
    .hide-scrollbar::-webkit-scrollbar,
    .hide-scrollbar::-webkit-scrollbar-horizontal,
    .hide-scrollbar::-webkit-scrollbar-vertical {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      background: transparent !important;
    }
    .hide-scrollbar {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
      overflow-x: hidden !important;
    }
  `]
})
export class CustomDateTimePickerComponent implements ControlValueAccessor {
  placeholder = input<string>('Select date');
  disabled = input<boolean>(false);

  private formDisabled = signal<boolean>(false);
  effectiveDisabled = computed(() => this.disabled() || this.formDisabled());

  selectedDate = signal<Date | null>(new Date());

  // Time Signals (12-hour format)
  selectedHour = signal<number>(12);
  selectedMinute = signal<number>(0);
  selectedPeriod = signal<'AM' | 'PM'>('PM');

  isTimeOpen = signal<boolean>(false);

  readonly hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  readonly minutesList = Array.from({ length: 60 }, (_, i) => i);


  onChange: any = () => {};
  onTouched: any = () => {};

  toggleTimeDropdown(event: Event) {
    event.stopPropagation();
    if (this.effectiveDisabled()) return;
    this.isTimeOpen.update(v => !v);
  }


  setHour(h: number) {
    this.selectedHour.set(h);
    this.emitValue();
  }

  setMinute(m: number) {
    this.selectedMinute.set(m);
    this.emitValue();
  }

  setPeriod(p: 'AM' | 'PM') {
    this.selectedPeriod.set(p);
    this.emitValue();
  }

  setNow() {
    const now = new Date();
    this.selectedDate.set(now);
    this.parseHoursMinutes(now.getHours(), now.getMinutes());
    this.emitValue();
  }

  padZero(num: number): string {
    return String(num).padStart(2, '0');
  }

  displayTimeLabel = computed(() => {
    const h = this.padZero(this.selectedHour());
    const m = this.padZero(this.selectedMinute());
    const p = this.selectedPeriod();
    return `${h}:${m} ${p}`;
  });

  onDateSelected(newDate: Date | null) {
    if (!newDate) return;
    this.selectedDate.set(newDate);
    this.emitValue();
  }

  private get24Hour(): number {
    let h = this.selectedHour();
    const period = this.selectedPeriod();

    if (period === 'PM' && h < 12) {
      h += 12;
    } else if (period === 'AM' && h === 12) {
      h = 0;
    }
    return h;
  }

  private emitValue() {
    const d = this.selectedDate();
    if (!d) return;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    const h24 = String(this.get24Hour()).padStart(2, '0');
    const m24 = String(this.selectedMinute()).padStart(2, '0');

    // Format: YYYY-MM-DDTHH:mm (expected by Spring Boot LocalDateTime)
    const isoDateTime = `${year}-${month}-${day}T${h24}:${m24}`;

    this.onChange(isoDateTime);
    this.onTouched();
  }

  // ControlValueAccessor methods
  writeValue(val: any): void {
    if (!val) {
      const now = new Date();
      this.selectedDate.set(now);
      this.parseHoursMinutes(now.getHours(), now.getMinutes());
      return;
    }

    try {
      const parsedDate = new Date(val);
      if (!isNaN(parsedDate.getTime())) {
        this.selectedDate.set(parsedDate);
        this.parseHoursMinutes(parsedDate.getHours(), parsedDate.getMinutes());
      } else if (typeof val === 'string' && val.includes('T')) {
        const parts = val.split('T');
        this.selectedDate.set(new Date(parts[0]));
        const timeParts = parts[1].split(':');
        this.parseHoursMinutes(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10));
      }
    } catch (e) {
      // Fallback
    }
  }

  private parseHoursMinutes(hours24: number, minutes: number) {
    let h12 = hours24 % 12;
    if (h12 === 0) h12 = 12;

    this.selectedHour.set(h12);
    this.selectedMinute.set(minutes);
    this.selectedPeriod.set(hours24 >= 12 ? 'PM' : 'AM');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}

