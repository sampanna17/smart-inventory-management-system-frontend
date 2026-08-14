import { Component, computed, inject, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../services/supplier.service';
import { ProductService } from '../../../products/services/product.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Supplier, ProductSummary } from '../../../../core/models/supplier.model';
import { Product } from '../../../../core/models/product.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { DateTimeComponent } from '../../../../shared/components/date-time/date-time.component';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroXMark, heroUser, heroPhone, heroEnvelope, heroMapPin,
  heroPencilSquare, heroArchiveBox, heroArrowPath, heroBuildingStorefront,
  heroPlus
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-supplier-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HasRoleDirective,
    DateTimeComponent,
    CustomSelectComponent,
    NgIconComponent
  ],
  viewProviders: [provideIcons({
    heroXMark, heroUser, heroPhone, heroEnvelope, heroMapPin,
    heroPencilSquare, heroArchiveBox, heroArrowPath, heroBuildingStorefront,
    heroPlus
  })],
  templateUrl: './supplier-detail-modal.component.html'
})
export class SupplierDetailModalComponent {
  isOpen = input<boolean>(false);
  supplier = input<Supplier | null>(null);

  close = output<void>();
  edit = output<Supplier>();

  supplierService = inject(SupplierService);
  productService = inject(ProductService);
  authService = inject(AuthService);

  readonly Role = Role;

  selectedProductToAssign = signal<string>('');
  allProducts = signal<Product[]>([]);
  isLoadingAllProducts = signal<boolean>(false);

  availableProductOptions = computed(() => {
    const assigned = this.supplierService.supplierProducts();
    const assignedIds = new Set(assigned.map(p => p.productId));
    return this.allProducts()
      .filter(p => !assignedIds.has(p.productId))
      .map(p => ({
        label: `${p.productName} (Stock: ${p.stockQuantity})`,
        value: String(p.productId)
      }));
  });

  constructor() {
    effect(() => {
      const s = this.supplier();
      const open = this.isOpen();
      if (open && s) {
        this.selectedProductToAssign.set('');
        this.supplierService.loadSupplierProducts(s.supplierID);
        this.loadAvailableProducts();
      } else {
        this.selectedProductToAssign.set('');
      }
    });
  }

  loadAvailableProducts(): void {
    this.isLoadingAllProducts.set(true);
    this.productService.getAllProductsList().subscribe({
      next: (res) => {
        this.isLoadingAllProducts.set(false);
        if (res.success && res.data) {
          this.allProducts.set(res.data);
        }
      },
      error: () => {
        this.isLoadingAllProducts.set(false);
      }
    });
  }

  assignProduct(): void {
    const s = this.supplier();
    const prodId = Number(this.selectedProductToAssign());
    if (s && prodId) {
      this.supplierService.assignProductToSupplier(s.supplierID, prodId).subscribe({
        next: () => {
          this.selectedProductToAssign.set('');
        }
      });
    }
  }

  removeProduct(prod: ProductSummary): void {
    const s = this.supplier();
    if (s && prod) {
      this.supplierService.removeProductFromSupplier(s.supplierID, prod.productId).subscribe();
    }
  }

  onEdit(): void {
    const s = this.supplier();
    if (s) {
      this.edit.emit(s);
    }
  }
}
