import { Component, computed, inject, input, output, effect, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { SupplierService } from '../../../suppliers/services/supplier.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Product, ProductImage } from '../../../../core/models/product.model';
import { SupplierSummary } from '../../../../core/models/supplier.model';
import { Role } from '../../../../core/auth/enums/role.enum';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroXMark, heroPhoto, heroCloudArrowUp, heroTrash, heroPencilSquare,
  heroExclamationTriangle, heroCheckCircle, heroArchiveBox, heroArrowPath,
  heroPlus, heroUserGroup, heroUserMinus
} from '@ng-icons/heroicons/outline';

import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, HasRoleDirective, NgIconComponent, NprCurrencyPipe, NgOptimizedImage, CustomSelectComponent],
  viewProviders: [provideIcons({
    heroXMark, heroPhoto, heroCloudArrowUp, heroTrash, heroPencilSquare,
    heroExclamationTriangle, heroCheckCircle, heroArchiveBox, heroArrowPath,
    heroPlus, heroUserGroup, heroUserMinus
  })],
  templateUrl: './product-detail-modal.component.html'
})
export class ProductDetailModalComponent {
  isOpen = input<boolean>(false);
  product = input<Product | null>(null);

  close = output<void>();
  edit = output<Product>();

  productService = inject(ProductService);
  supplierService = inject(SupplierService);
  authService = inject(AuthService);

  readonly Role = Role;

  activeImageIndex = signal<number>(0);
  selectedSupplierToAssign = signal<string>('');

  availableSupplierOptions = computed(() => {
    const assigned = this.productService.assignedSuppliers();
    const assignedIds = new Set(assigned.map(s => s.supplierId));
    return this.supplierService.suppliers()
      .filter(s => !assignedIds.has(s.supplierID))
      .map(s => ({ label: `${s.supplierName} (${s.phone})`, value: String(s.supplierID) }));
  });

  constructor() {
    effect(() => {
      const p = this.product();
      const open = this.isOpen();
      if (open && p) {
        this.activeImageIndex.set(0);
        this.selectedSupplierToAssign.set('');
        this.productService.loadProductImages(p.productId);
        this.productService.loadProductSuppliers(p.productId);
        this.supplierService.loadSuppliers();
      } else {
        this.activeImageIndex.set(0);
        this.productService.clearProductImages();
      }
    });
  }

  activeImage = computed(() => {
    const images = this.productService.productImages();
    const index = this.activeImageIndex();
    if (images && images.length > index) {
      return images[index];
    }
    const p = this.product();
    if (p && p.primaryImageUrl) {
      return { imageId: 0, productId: p.productId, imageURL: p.primaryImageUrl, publicId: '' } as ProductImage;
    }
    return null;
  });

  stockStatus = computed(() => {
    const p = this.product();
    if (!p) return { label: 'Unknown', color: 'bg-slate-100 text-slate-700 border-slate-300' };

    if (p.stockQuantity <= 0) {
      return { label: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-200' };
    } else if (p.stockQuantity <= p.reorderLevel) {
      return { label: 'Low Stock Alert', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  });

  profitMargin = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return p.sellingPrice - p.costPrice;
  });

  profitPercentage = computed(() => {
    const p = this.product();
    if (!p || p.costPrice <= 0) return 0;
    return ((p.sellingPrice - p.costPrice) / p.costPrice) * 100;
  });

  totalInventoryValue = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return p.stockQuantity * p.costPrice;
  });

  onImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const p = this.product();
    if (input.files && input.files[0] && p) {
      const file = input.files[0];
      this.productService.uploadImage(p.productId, file).subscribe();
    }
  }

  deleteImage(img: ProductImage) {
    const p = this.product();
    if (p && img) {
      this.productService.deleteImage(p.productId, img.imageId).subscribe(() => {
        if (this.activeImageIndex() > 0) {
          this.activeImageIndex.update(i => i - 1);
        }
      });
    }
  }

  assignSupplier() {
    const p = this.product();
    const supId = Number(this.selectedSupplierToAssign());
    if (p && supId) {
      this.productService.assignSupplierToProduct(p.productId, supId).subscribe({
        next: () => {
          this.selectedSupplierToAssign.set('');
        }
      });
    }
  }

  removeSupplier(supplier: SupplierSummary) {
    const p = this.product();
    if (p && supplier) {
      this.productService.removeSupplierFromProduct(p.productId, supplier.supplierId).subscribe();
    }
  }

  onEdit() {
    const p = this.product();
    if (p) {
      this.edit.emit(p);
    }
  }
}

