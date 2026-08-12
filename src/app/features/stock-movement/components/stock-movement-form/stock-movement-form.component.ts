import { Component, inject, input, output, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockMovementService } from '../../services/stock-movement.service';
import { ProductService } from '../../../products/services/product.service';
import { MovementType, CreateStockMovementRequest } from '../../models/stock-movement.model';
import { Product } from '../../../../core/models/product.model';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark, heroArrowPath } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-stock-movement-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent, NgIconComponent],
  viewProviders: [provideIcons({ heroXMark, heroArrowPath })],
  templateUrl: './stock-movement-form.component.html'
})
export class StockMovementFormComponent implements OnInit {
  isOpen = input<boolean>(false);
  close = output<void>();
  saved = output<void>();

  private fb = inject(FormBuilder);
  stockMovementService = inject(StockMovementService);
  private productService = inject(ProductService);

  movementForm!: FormGroup;
  products = signal<Product[]>([]);
  isLoadingProducts = signal<boolean>(false);

  readonly MovementType = MovementType;

  movementTypeOptions = [
    { label: 'Purchase (Inflow)', value: MovementType.PURCHASE },
    { label: 'Sale (Outflow)', value: MovementType.SALE },
    { label: 'Stock Adjustment', value: MovementType.ADJUSTMENT },
    { label: 'Customer Return (Inflow)', value: MovementType.RETURN }
  ];

  get productSelectOptions() {
    return this.products().map(p => ({
      label: `${p.productName} (Current Stock: ${p.stockQuantity ?? 0})`,
      value: p.productId
    }));
  }

  ngOnInit() {
    this.initForm();
  }

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open) {
        this.loadProductsList();
        setTimeout(() => {
          if (this.movementForm) {
            this.movementForm.reset({
              productId: null,
              movementType: MovementType.ADJUSTMENT,
              quantity: 1,
              remarks: ''
            });
          }
        });
      }
    });
  }

  private initForm() {
    this.movementForm = this.fb.group({
      productId: [null, [Validators.required]],
      movementType: [MovementType.ADJUSTMENT, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      remarks: ['', [Validators.maxLength(255)]]
    });
  }

  private loadProductsList() {
    this.isLoadingProducts.set(true);
    this.productService.getAllProductsList().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.products.set(res.data);
        }
        this.isLoadingProducts.set(false);
      },
      error: () => {
        this.isLoadingProducts.set(false);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.movementForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  closeModal(force = false) {
    if (!force && this.stockMovementService.isSubmitting()) return;
    this.movementForm.reset();
    this.close.emit();
  }

  onSubmit() {
    if (this.movementForm.invalid) {
      this.movementForm.markAllAsTouched();
      return;
    }

    const formVal = this.movementForm.value;
    const request: CreateStockMovementRequest = {
      productId: Number(formVal.productId),
      movementType: formVal.movementType,
      quantity: Number(formVal.quantity),
      remarks: formVal.remarks?.trim() || undefined
    };

    this.stockMovementService.createStockMovement(request).subscribe({
      next: () => {
        this.saved.emit();
        this.closeModal(true);
      }
    });
  }
}
