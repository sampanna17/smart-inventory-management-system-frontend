import { Component, computed, inject, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplierService } from '../../services/supplier.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Supplier } from '../../../../core/models/supplier.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroXMark, heroUser, heroPhone, heroEnvelope, heroMapPin,
  heroPencilSquare, heroArchiveBox, heroArrowPath, heroBuildingStorefront
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-supplier-detail-modal',
  standalone: true,
  imports: [CommonModule, HasRoleDirective, DateTimeComponent, NgIconComponent],
  viewProviders: [provideIcons({
    heroXMark, heroUser, heroPhone, heroEnvelope, heroMapPin,
    heroPencilSquare, heroArchiveBox, heroArrowPath, heroBuildingStorefront
  })],
  templateUrl: './supplier-detail-modal.component.html'
})
export class SupplierDetailModalComponent {
  isOpen = input<boolean>(false);
  supplier = input<Supplier | null>(null);

  close = output<void>();
  edit = output<Supplier>();

  supplierService = inject(SupplierService);
  authService = inject(AuthService);

  readonly Role = Role;

  constructor() {
    effect(() => {
      const s = this.supplier();
      const open = this.isOpen();
      if (open && s) {
        this.supplierService.loadSupplierProducts(s.supplierID);
      }
    });
  }

  onEdit() {
    const s = this.supplier();
    if (s) {
      this.edit.emit(s);
    }
  }
}
