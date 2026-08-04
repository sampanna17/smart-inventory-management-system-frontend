import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <nav class="navbar">
        <div class="logo">SIMS Dashboard</div>
        <button class="logout-btn" (click)="logout()">Logout</button>
      </nav>

      <main class="content">
        <div class="welcome-card">
          <div class="role-badge" *ngIf="currentUser()?.role">
            {{ currentUser()?.role }}
          </div>
          <h1>Welcome, {{ currentUser()?.fullName || 'User' }}!</h1>
          <p>This is your dummy dashboard. You have successfully logged in.</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background-color: #f3f4f6;
      font-family: 'Inter', sans-serif;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: #1e293b;
      color: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .logo {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .logout-btn {
      background-color: #ef4444;
      color: white;
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .logout-btn:hover {
      background-color: #dc2626;
    }

    .content {
      padding: 4rem 2rem;
      display: flex;
      justify-content: center;
    }

    .welcome-card {
      background: white;
      padding: 3rem;
      border-radius: 1rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      text-align: center;
      max-width: 600px;
      width: 100%;
    }

    .welcome-card h1 {
      margin: 0 0 1rem 0;
      color: #0f172a;
      font-size: 2.25rem;
    }

    .role-badge {
      display: inline-block;
      background-color: #3b82f6;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .welcome-card p {
      color: #64748b;
      font-size: 1.125rem;
      margin: 0;
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
