import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Customer } from '../../../../core/models/customer.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CustomerFormComponent } from '../../components/customer-form/customer-form.component';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPencilSquare, heroTrash } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
    CustomerFormComponent,
    HasRoleDirective,
    NgIconComponent
  ],
  viewProviders: [provideIcons({ heroPencilSquare, heroTrash })],
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent implements OnInit {
  customerService = inject(CustomerService);
  private authService = inject(AuthService);

  readonly Role = Role;

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedCustomer = signal<Customer | null>(null);

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerService.loadCustomers();
  }

  openCreateModal() {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedCustomer.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(customer: Customer) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedCustomer.set(customer);
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    setTimeout(() => this.selectedCustomer.set(null), 200);
  }

  openDeleteConfirm(customer: Customer) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedCustomer.set(customer);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => this.selectedCustomer.set(null), 200);
  }

  confirmDelete() {
    const customer = this.selectedCustomer();
    if (!customer || !this.authService.hasRole(Role.ADMIN)) return;

    this.customerService.deleteCustomer(customer.customerID).subscribe({
      next: () => {
        this.closeDeleteModal();
      }
    });
  }
}
