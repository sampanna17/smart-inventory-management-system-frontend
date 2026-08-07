import { Component, computed, inject, input, output, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PurchaseService } from '../../services/purchase.service';
import { SupplierService } from '../../../suppliers/services/supplier.service';
import { ProductService } from '../../../products/services/product.service';
import { Purchase, CreatePurchaseRequest, UpdatePurchaseRequest, SupplierProductSummary } from '../../models/purchase.model';
import { Product } from '../../../../core/models/product.model';
import { Supplier } from '../../../../core/models/supplier.model';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark, heroPlus, heroTrash } from '@ng-icons/heroicons/outline';

import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { CustomDateTimePickerComponent } from '../../../../shared/components/custom-date-picker/custom-date-picker.component';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormErrorComponent,
    NprCurrencyPipe,
    NgIconComponent,
    CustomSelectComponent,
    CustomDateTimePickerComponent
  ],
  viewProviders: [provideIcons({ heroXMark, heroPlus, heroTrash })],
  templateUrl: './purchase-form.component.html'
})
export class PurchaseFormComponent implements OnInit {
  isOpen = input<boolean>(false);
  purchase = input<Purchase | null>(null);

  close = output<void>();
  saved = output<void>();

  private fb = inject(FormBuilder);
  purchaseService = inject(PurchaseService);
  supplierService = inject(SupplierService);
  productService = inject(ProductService);

  purchaseForm!: FormGroup;
  availableProducts = signal<{ productId: number; productName: string; unitPrice?: number }[]>([]);
  isLoadingProducts = signal<boolean>(false);

  isEditMode = computed(() => !!this.purchase());

  ngOnInit() {
    this.initForm();
    this.supplierService.loadSuppliers();
    this.productService.loadProducts();
  }

  constructor() {
    effect(() => {
      const p = this.purchase();
      const open = this.isOpen();
      if (open && this.purchaseForm) {
        setTimeout(() => {
          if (p) {
            this.setupEditForm(p);
          } else {
            this.resetForm();
          }
        });
      }
    });
  }

  private initForm() {
    this.purchaseForm = this.fb.group({
      supplierId: ['', [Validators.required]],
      purchaseDate: [new Date().toISOString().substring(0, 16), [Validators.required]],
      items: this.fb.array([])
    });

    // Listen to supplier changes
    this.purchaseForm.get('supplierId')?.valueChanges.subscribe(supplierId => {
      if (supplierId) {
        this.loadSupplierProducts(Number(supplierId));
      } else {
        this.availableProducts.set([]);
      }
    });
  }

  get items(): FormArray {
    return this.purchaseForm.get('items') as FormArray;
  }

  createItemFormGroup(productId = '', quantity = 1, unitPrice = 0): FormGroup {
    const group = this.fb.group({
      productId: [productId, [Validators.required]],
      quantity: [quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0.01)]]
    });

    // Auto-fill price when product changes
    group.get('productId')?.valueChanges.subscribe(pId => {
      if (pId) {
        const prod = this.productService.products().find(p => p.productId === Number(pId));
        if (prod && !group.get('unitPrice')?.value) {
          group.patchValue({ unitPrice: prod.costPrice });
        }
      }
    });

    return group;
  }

  addItemRow(productId = '', quantity = 1, unitPrice = 0) {
    this.items.push(this.createItemFormGroup(productId, quantity, unitPrice));
  }

  removeItemRow(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  private loadSupplierProducts(supplierId: number) {
    this.isLoadingProducts.set(true);
    this.purchaseService.getProductsBySupplier(supplierId).subscribe({
      next: (res) => {
        this.isLoadingProducts.set(false);
        if (res.data && res.data.length > 0) {
          this.availableProducts.set(res.data);
        } else {
          // Fallback to all products if none linked
          this.availableProducts.set(
            this.productService.products().map(p => ({ productId: p.productId, productName: p.productName, unitPrice: p.costPrice }))
          );
        }
      },
      error: () => {
        this.isLoadingProducts.set(false);
        // Fallback to all products
        this.availableProducts.set(
          this.productService.products().map(p => ({ productId: p.productId, productName: p.productName, unitPrice: p.costPrice }))
        );
      }
    });
  }

  private setupEditForm(p: Purchase) {
    this.items.clear();
    const formattedDate = p.purchaseDate ? new Date(p.purchaseDate).toISOString().substring(0, 16) : new Date().toISOString().substring(0, 16);

    this.purchaseForm.patchValue({
      supplierId: p.supplierId,
      purchaseDate: formattedDate
    });

    this.loadSupplierProducts(p.supplierId);

    if (p.items && p.items.length > 0) {
      p.items.forEach(item => {
        this.addItemRow(String(item.productId), item.quantity, item.unitPrice);
      });
    } else {
      this.addItemRow();
    }
  }

  private resetForm() {
    this.items.clear();
    this.purchaseForm.reset({
      supplierId: '',
      purchaseDate: new Date().toISOString().substring(0, 16)
    });
    this.availableProducts.set([]);
    this.addItemRow();
  }

  getItemSubtotal(index: number): number {
    const itemGroup = this.items.at(index);
    const qty = Number(itemGroup.get('quantity')?.value) || 0;
    const price = Number(itemGroup.get('unitPrice')?.value) || 0;
    return qty * price;
  }

  get grandTotal(): number {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      total += this.getItemSubtotal(i);
    }
    return total;
  }

  closeModal(force = false) {
    if (!force && this.purchaseService.isSubmitting()) return;
    this.close.emit();
  }

  onSubmit() {
    if (this.purchaseForm.invalid || this.items.length === 0) {
      this.purchaseForm.markAllAsTouched();
      return;
    }

    const formValue = this.purchaseForm.value;
    const itemsReq = formValue.items.map((i: any) => ({
      productId: Number(i.productId),
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice)
    }));

    if (this.isEditMode() && this.purchase()) {
      const updateReq: UpdatePurchaseRequest = {
        supplierId: Number(formValue.supplierId),
        purchaseDate: formValue.purchaseDate,
        items: itemsReq
      };

      this.purchaseService.updatePurchase(this.purchase()!.purchaseId, updateReq).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal(true);
        }
      });
    } else {
      const createReq: CreatePurchaseRequest = {
        supplierId: Number(formValue.supplierId),
        purchaseDate: formValue.purchaseDate,
        items: itemsReq
      };

      this.purchaseService.createPurchase(createReq).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal(true);
        }
      });
    }
  }
}
