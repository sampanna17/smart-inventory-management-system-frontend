import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitService } from '../../services/unit.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Unit } from '../../../../core/models/unit.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UnitFormComponent } from '../../components/unit-form/unit-form.component';
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
    NgIconComponent
  ],
  viewProviders: [provideIcons({ heroPencilSquare, heroTrash })],
  templateUrl: './unit-list.component.html'
})
export class UnitListComponent implements OnInit {
  unitService = inject(UnitService);
  private authService = inject(AuthService);

  // Modal states
  isFormModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  selectedUnit = signal<Unit | null>(null);

  isAdmin = computed(() => {
    const user = this.authService.currentUser();
    return user?.role === 'ADMIN';
  });

  ngOnInit() {
    this.loadUnits();
  }

  loadUnits() {
    this.unitService.loadUnits();
  }

  openCreateModal() {
    if (!this.isAdmin()) return;
    this.selectedUnit.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(unit: Unit) {
    if (!this.isAdmin()) return;
    this.selectedUnit.set(unit);
    this.isFormModalOpen.set(true);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    // Delay clearing selected to prevent flicker during close animation
    setTimeout(() => this.selectedUnit.set(null), 200);
  }

  openDeleteConfirm(unit: Unit) {
    if (!this.isAdmin()) return;
    this.selectedUnit.set(unit);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    setTimeout(() => this.selectedUnit.set(null), 200);
  }

  confirmDelete() {
    const unit = this.selectedUnit();
    if (!unit || !this.isAdmin()) return;

    this.unitService.deleteUnit(unit.unitId).subscribe({
      next: () => {
        this.closeDeleteModal();
      }
    });
  }
}
