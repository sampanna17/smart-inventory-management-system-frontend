import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { UserProfile } from '../../models/user-profile.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { Status } from '../../../../core/enums/status.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CreateStaffFormComponent } from '../../components/create-staff-form/create-staff-form.component';
import { UserDetailModalComponent } from '../../components/user-detail-modal/user-detail-modal.component';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroEye,
  heroTrash,
  heroCheckCircle,
  heroXCircle,
  heroMagnifyingGlass,
  heroXMark,
  heroBarsArrowDown,
  heroBarsArrowUp,
  heroUsers,
  heroShieldCheck,
  heroUser
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatPaginatorModule,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
    CreateStaffFormComponent,
    UserDetailModalComponent,
    HasRoleDirective,
    CustomSelectComponent,
    NgIconComponent
  ],
  viewProviders: [
    provideIcons({
      heroEye,
      heroTrash,
      heroCheckCircle,
      heroXCircle,
      heroMagnifyingGlass,
      heroXMark,
      heroBarsArrowDown,
      heroBarsArrowUp,
      heroUsers,
      heroShieldCheck,
      heroUser
    })
  ],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  userService = inject(UserService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  readonly Role = Role;
  readonly Status = Status;

  private searchSubject = new Subject<string>();

  // Filter & Search Signals
  searchQuery = signal<string>('');
  selectedRoleFilter = signal<string>('ALL');
  selectedStatusFilter = signal<string>('ALL');
  sortBy = signal<'name' | 'email' | 'role' | 'status' | 'date'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  pageSizeOptions: number[] = [5, 10, 25, 50];

  sortOptions = [
    { label: 'Date Added', value: 'date' },
    { label: 'Full Name', value: 'name' },
    { label: 'Email Address', value: 'email' },
    { label: 'Role', value: 'role' },
    { label: 'Status', value: 'status' }
  ];

  // Modal states
  isCreateModalOpen = signal<boolean>(false);
  isDetailModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  isActivateModalOpen = signal<boolean>(false);
  isDeactivateModalOpen = signal<boolean>(false);
  selectedUser = signal<UserProfile | null>(null);

  // Server-fed data accessors
  users = computed(() => this.userService.users());
  totalElements = computed(() => this.userService.totalElements());
  totalPages = computed(() => Math.max(1, this.userService.totalPages()));

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadUsers();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.userService.loadUsers({
      page: this.currentPage() - 1, // backend is 0-indexed
      size: this.pageSize(),
      search: this.searchQuery(),
      role: this.selectedRoleFilter() !== 'ALL' ? this.selectedRoleFilter() : undefined,
      status: this.selectedStatusFilter() !== 'ALL' ? this.selectedStatusFilter() : undefined,
      sortBy: this.sortBy(),
      sortDir: this.sortOrder()
    });
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadUsers();
  }

  setRoleFilter(role: string): void {
    this.selectedRoleFilter.set(role);
    this.currentPage.set(1);
    this.loadUsers();
  }

  setStatusFilter(status: string): void {
    this.selectedStatusFilter.set(status);
    this.currentPage.set(1);
    this.loadUsers();
  }

  onSortChange(sortBy: string): void {
    this.sortBy.set(sortBy as any);
    this.loadUsers();
  }

  toggleSortOrder(): void {
    this.sortOrder.update(o => (o === 'asc' ? 'desc' : 'asc'));
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex + 1);
    this.loadUsers();
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
        this.loadUsers();
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
        this.loadUsers();
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
        this.loadUsers();
      }
    });
  }

  // Helper: check if user is STAFF (actions only apply to staff)
  isStaff(user: UserProfile): boolean {
    return user.role === Role.STAFF;
  }
}
