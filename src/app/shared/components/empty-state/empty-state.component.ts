import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroArchiveBox } from '@ng-icons/heroicons/outline';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Role } from '../../../core/auth/enums/role.enum';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [provideIcons({ heroArchiveBox })],
  template: `
    <div class="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-slate-200">
      <div class="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
        <ng-icon [name]="icon()" class="text-3xl text-slate-400"></ng-icon>
      </div>
      <h3 class="text-lg font-medium text-slate-900 mb-1">{{ title() }}</h3>
      <p class="text-sm text-slate-500 max-w-sm mb-6">{{ message() }}</p>

      @if (isActionVisible()) {
        <button
          (click)="action.emit()"
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  private authService = inject(AuthService);

  title = input<string>('No data found');
  message = input<string>('There is currently no data available to display.');
  icon = input<string>('heroArchiveBox');
  showAction = input<boolean>(false);
  roles = input<Role | Role[] | string | string[] | null>(null);
  actionLabel = input<string>('Create New');
  action = output<void>();

  isActionVisible = computed(() => {
    const rolesConfig = this.roles();
    if (rolesConfig !== null && rolesConfig !== undefined) {
      return this.authService.hasRole(rolesConfig);
    }
    return this.showAction();
  });
}
