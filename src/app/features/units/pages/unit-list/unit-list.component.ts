import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitService } from '../../services/unit.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Unit } from '../../../../core/models/unit.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UnitFormComponent } from '../../components/unit-form/unit-form.component';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroPencilSquare, heroTrash } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-unit-list',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
    UnitFormComponent,
    HasRoleDirective,
    NgIconComponent
  ],
  viewProviders: [provideIcons({ heroPencilSquare, heroTrash })],
  templateUrl: './unit-list.component.html'
})
export class UnitListComponent implements OnInit {
  unitService = inject(UnitService);
  private authService = inject(AuthService);

  readonly Role = Role;

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedUnit = signal<Unit | null>(null);

  ngOnInit() {
    this.loadUnits();
  }

  loadUnits() {
    this.unitService.loadUnits();
  }

  openCreateModal() {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedUnit.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(unit: Unit) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedUnit.set(unit);
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    setTimeout(() => this.selectedUnit.set(null), 200);
  }

  openDeleteConfirm(unit: Unit) {
    if (!this.authService.hasRole(Role.ADMIN)) return;
    this.selectedUnit.set(unit);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => this.selectedUnit.set(null), 200);
  }

  confirmDelete() {
    const unit = this.selectedUnit();
    if (!unit || !this.authService.hasRole(Role.ADMIN)) return;

    this.unitService.deleteUnit(unit.unitId).subscribe({
      next: () => {
        this.closeDeleteModal();
      }
    });
  }
}
