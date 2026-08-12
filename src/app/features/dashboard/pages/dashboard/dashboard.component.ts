import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl">
        @if (currentUser()?.role) {
          <span class="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            {{ currentUser()?.role }}
          </span>
        }
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Welcome, {{ currentUser()?.fullName || 'User' }}!
        </h1>
        <p class="text-slate-500 text-base leading-relaxed">
          Welcome to the Smart Inventory Management System (SIMS). Use the navigation sidebar to manage products, sales, purchases, and track stock movements.
        </p>
      </div>
    </div>
  `
})
export class DashboardComponent {
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
}

