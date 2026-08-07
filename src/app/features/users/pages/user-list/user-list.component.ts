import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { UserProfile } from '../../models/user-profile.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CreateStaffFormComponent } from '../../components/create-staff-form/create-staff-form.component';
import { UserDetailModalComponent } from '../../components/user-detail-modal/user-detail-modal.component';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroEye,
  heroTrash,
  heroCheckCircle,
  heroXCircle,
  heroMagnifyingGlass,
  heroXMark
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
    CreateStaffFormComponent,
    UserDetailModalComponent,
    HasRoleDirective,
    NgIconComponent
  ],
  viewProviders: [provideIcons({ heroEye, heroTrash, heroCheckCircle, heroXCircle, heroMagnifyingGlass, heroXMark })],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  userService = inject(UserService);
  private authService = inject(AuthService);

  readonly Role = Role;

  // Search
  searchTerm = signal<string>('');

  // Modal states
  isCreateModalOpen = signal<boolean>(false);
  isDetailModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  isActivateModalOpen = signal<boolean>(false);
  isDeactivateModalOpen = signal<boolean>(false);
  selectedUser = signal<UserProfile | null>(null);

  // Filtered users (client-side search)
  filteredUsers = computed(() => {
    const users = this.userService.users();
    const term = this.searchTerm().toLowerCase().trim();

    if (!term) return users;

    return users.filter(user =>
      user.fullName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term) ||
      user.status.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.loadUsers();
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
  }

  clearSearch() {
    this.searchTerm.set('');
  }

  // Create Staff Modal
  openCreateModal() {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal() {
    this.isCreateModalOpen.set(false);
  }

  onStaffCreated() {
    this.loadUsers();
  }

  // Detail Modal
  openDetailModal(user: UserProfile) {
    this.selectedUser.set(user);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    setTimeout(() => this.selectedUser.set(null), 200);
  }

  // Delete Confirmation
  openDeleteConfirm(user: UserProfile) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedUser.set(user);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => this.selectedUser.set(null), 200);
  }

  confirmDelete() {
    const user = this.selectedUser();
    if (!user || !this.authService.hasRole(Role.ADMIN)) return;

    this.userService.deleteStaff(user.userID).subscribe({
      next: () => {
        this.closeDeleteModal();
      }
    });
  }

  // Activate Confirmation
  openActivateConfirm(user: UserProfile) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedUser.set(user);
    this.isActivateModalOpen.set(true);
  }

  closeActivateModal() {
    this.isActivateModalOpen.set(false);
    setTimeout(() => this.selectedUser.set(null), 200);
  }

  confirmActivate() {
    const user = this.selectedUser();
    if (!user || !this.authService.hasRole(Role.ADMIN)) return;

    this.userService.activateStaff(user.userID).subscribe({
      next: () => {
        this.closeActivateModal();
      }
    });
  }

  // Deactivate Confirmation
  openDeactivateConfirm(user: UserProfile) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedUser.set(user);
    this.isDeactivateModalOpen.set(true);
  }

  closeDeactivateModal() {
    this.isDeactivateModalOpen.set(false);
    setTimeout(() => this.selectedUser.set(null), 200);
  }

  confirmDeactivate() {
    const user = this.selectedUser();
    if (!user || !this.authService.hasRole(Role.ADMIN)) return;

    this.userService.deactivateStaff(user.userID).subscribe({
      next: () => {
        this.closeDeactivateModal();
      }
    });
  }

  // Helper: check if user is STAFF (actions only apply to staff)
  isStaff(user: UserProfile): boolean {
    return user.role === 'STAFF';
  }
}
