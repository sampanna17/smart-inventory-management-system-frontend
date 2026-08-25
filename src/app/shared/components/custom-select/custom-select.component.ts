import { Component, ElementRef, HostListener, forwardRef, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroChevronDown, heroMagnifyingGlass, heroCheck } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-select',
  standalone: true,
  host: {
    class: 'block w-full'
  },
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [provideIcons({ heroChevronDown, heroMagnifyingGlass, heroCheck })],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative w-full text-left" [class]="styleClass()">
      <!-- Select Trigger Button -->
      <button
        type="button"
        (click)="toggleDropdown()"
        [disabled]="effectiveDisabled()"
        class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 shadow-sm flex items-center justify-between gap-2 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer min-h-[38px]"
      >
        <span class="truncate" [class.text-slate-400]="!selectedOption()">
          {{ selectedLabel() || placeholder() }}
        </span>
        <ng-icon name="heroChevronDown" class="text-slate-400 text-sm transition-transform duration-200" [class.rotate-180]="isOpen()"></ng-icon>
      </button>

      <!-- Overlay Panel -->
      @if (isOpen()) {
        <div class="absolute z-[100] mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 max-h-60 flex flex-col transition-all animate-in fade-in duration-100">

          <!-- Search Filter Header -->
          @if (filter() && options().length > 5) {
            <div class="p-2 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div class="relative">
                <ng-icon name="heroMagnifyingGlass" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></ng-icon>
                <input
                  type="text"
                  [ngModel]="searchQuery()"
                  (ngModelChange)="searchQuery.set($event)"
                  placeholder="Search..."
                  class="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-800"
                  (click)="$event.stopPropagation()"
                />
              </div>
            </div>
          }

          <!-- Options List -->
          <div class="overflow-y-auto custom-scrollbar flex-1 max-h-48 py-1">
            @if (filteredOptions().length === 0) {
              <div class="px-3 py-2 text-xs text-slate-400 text-center">No results found</div>
            } @else {
              @for (opt of filteredOptions(); track getOptionValue(opt)) {
                <button
                  type="button"
                  (click)="selectOption(opt)"
                  class="w-full px-3 py-2 text-xs sm:text-sm text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                  [ngClass]="{
                    'bg-primary/10 text-primary font-semibold': isSelected(opt),
                    'hover:bg-slate-50 text-slate-700': !isSelected(opt)
                  }"
                >
                  <span class="truncate">{{ getOptionLabel(opt) }}</span>
                  @if (isSelected(opt)) {
                    <ng-icon name="heroCheck" class="text-primary text-sm shrink-0"></ng-icon>
                  }
                </button>
              }
            }
          </div>

        </div>
      }
    </div>
  `
})
export class CustomSelectComponent implements ControlValueAccessor {
  options = input<any[]>([]);
  optionLabel = input<string>('label');
  optionValue = input<string>('value');
  placeholder = input<string>('Select an option');
  filter = input<boolean>(true);
  disabled = input<boolean>(false);
  styleClass = input<string>('');

  private formDisabled = signal<boolean>(false);
  effectiveDisabled = computed(() => this.disabled() || this.formDisabled());

  isOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedValue = signal<any>(null);

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleDropdown() {
    if (this.effectiveDisabled()) return;
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.searchQuery.set('');
    }
  }

  getOptionLabel(opt: any): string {
    if (!opt) return '';
    if (typeof opt === 'object') {
      return opt[this.optionLabel()] ?? opt.label ?? String(opt);
    }
    return String(opt);
  }

  getOptionValue(opt: any): any {
    if (!opt) return null;
    const key = this.optionValue();
    if (typeof opt === 'object' && key && key in opt) {
      return opt[key];
    }
    return opt;
  }

  filteredOptions = computed(() => {
    const list = this.options() || [];
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return list;

    return list.filter(opt =>
      this.getOptionLabel(opt).toLowerCase().includes(query)
    );
  });

  selectedOption = computed(() => {
    const val = this.selectedValue();
    if (val === null || val === undefined || val === '') return null;
    return (this.options() || []).find(opt => this.getOptionValue(opt) === val) || null;
  });

  selectedLabel = computed(() => {
    const opt = this.selectedOption();
    return opt ? this.getOptionLabel(opt) : '';
  });

  isSelected(opt: any): boolean {
    return this.getOptionValue(opt) === this.selectedValue();
  }

  selectOption(opt: any) {
    const val = this.getOptionValue(opt);
    this.selectedValue.set(val);
    this.onChange(val);
    this.onTouched();
    this.isOpen.set(false);
  }

  // ControlValueAccessor methods
  writeValue(val: any): void {
    this.selectedValue.set(val);
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

