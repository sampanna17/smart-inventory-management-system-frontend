import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-card">
      <div class="role-badge" *ngIf="currentUser()?.role">
        {{ currentUser()?.role }}
      </div>
      <h1 class="text-3xl font-bold text-heading mb-4">Welcome, {{ currentUser()?.fullName || 'User' }}!</h1>
      <p class="text-muted text-lg">This is your dashboard. You have successfully logged in to SIMS.</p>
    </div>
  `,
  styles: [`
    .welcome-card {
      background: var(--color-surface);
      padding: 3rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid var(--color-border);
      max-width: 600px;
    }

    .role-badge {
      display: inline-block;
      background-color: var(--color-primary);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `]

})
export class DashboardComponent {
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
  }
}
