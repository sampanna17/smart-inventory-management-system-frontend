import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroExclamationTriangle, heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ heroExclamationTriangle, heroXMark })],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" (click)="cancel.emit()"></div>

        <!-- Modal Panel -->
        <div class="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-xl transition-all">
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              
              <div class="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
                   [ngClass]="type() === 'danger' ? 'bg-red-100' : 'bg-primary/10'">
                <ng-icon name="heroExclamationTriangle" class="text-xl"
                         [ngClass]="type() === 'danger' ? 'text-red-600' : 'text-primary'"></ng-icon>
              </div>

              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 class="text-lg font-semibold leading-6 text-slate-900" id="modal-title">
                  {{ title() }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-slate-500">
                    {{ message() }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              [disabled]="isLoading()"
              (click)="confirm.emit()"
              class="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              [ngClass]="type() === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-primary hover:bg-primary/90'"
            >
              @if (isLoading()) {
                <span class="inline-block animate-spin mr-2">⟳</span>
              }
              {{ confirmLabel() }}
            </button>
            <button
              type="button"
              [disabled]="isLoading()"
              (click)="cancel.emit()"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ cancelLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  isOpen = input<boolean>(false);
  title = input<string>('Confirm Action');
  message = input<string>('Are you sure you want to proceed with this action?');
  confirmLabel = input<string>('Confirm');
  cancelLabel = input<string>('Cancel');
  type = input<'danger' | 'primary'>('danger');
  isLoading = input<boolean>(false);

  confirm = output<void>();
  cancel = output<void>();
}
