import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Role } from '../../../../core/auth/enums/role.enum';
import { DashboardService } from '../../services/dashboard.service';
import { AdminDashboardComponent } from '../../admin/admin-dashboard.component';
import { StaffDashboardComponent } from '../../staff/staff-dashboard.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminDashboardComponent,
    StaffDashboardComponent,
    ErrorStateComponent,
    EmptyStateComponent
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  dashboardService = inject(DashboardService);

  currentUser = this.authService.currentUser;
  isAdmin = computed(() => this.currentUser()?.role === Role.ADMIN);
  isStaff = computed(() => this.currentUser()?.role === Role.STAFF);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const role = this.currentUser()?.role;
    if (role === Role.ADMIN) {
      this.dashboardService.loadAdminDashboard();
    } else if (role === Role.STAFF) {
      this.dashboardService.loadStaffDashboard();
    }
  }

  refreshData(): void {
    const role = this.currentUser()?.role || null;
    this.dashboardService.refreshDashboard(role);
  }
}
