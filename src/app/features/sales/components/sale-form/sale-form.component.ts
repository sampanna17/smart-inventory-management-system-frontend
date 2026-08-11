import { Component, computed, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SaleService } from '../../services/sale.service';
import { ProductService } from '../../../products/services/product.service';
import { CustomerService } from '../../../customers/services/customer.service';
import { SaleDetail, CreateSaleRequest, UpdateSaleRequest } from '../../models/sale.model';
import { Product } from '../../../../core/models/product.model';
import { Customer } from '../../../../core/models/customer.model';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { CustomDateTimePickerComponent } from '../../../../shared/components/custom-date-picker/custom-date-picker.component';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { NprCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark, heroPlus, heroTrash, heroExclamationCircle } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomSelectComponent,
    CustomDateTimePickerComponent,
    FormErrorComponent,
    NprCurrencyPipe,
    NgIconComponent
  ],
  viewProviders: [provideIcons({ heroXMark, heroPlus, heroTrash, heroExclamationCircle })],
  templateUrl: './sale-form.component.html'
})
export class SaleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  saleService = inject(SaleService);
  productService = inject(ProductService);
  customerService = inject(CustomerService);

  isOpen = input<boolean>(false);
  sale = input<SaleDetail | null>(null);

  close = output<void>();
  saved = output<void>();

  form!: FormGroup;
  availableProducts = signal<Product[]>([]);
  availableCustomers = signal<Customer[]>([]);

  customerOptions = computed(() =>
    this.customerService.customers().map(c => ({
      label: `${c.customerName} (${c.phone || c.email || 'No contact'})`,
      value: c.customerID
    }))
  );

  productOptions = computed(() =>
    this.productService.products().map(p => ({
      label: `${p.productName} (Stock: ${p.stockQuantity}) - Rs. ${p.sellingPrice}`,
      value: p.productId
    }))
  );

  isEditMode = computed(() => !!this.sale());

  constructor() {
    this.initForm();

    effect(() => {
      const open = this.isOpen();
      const currentSale = this.sale();
      if (open) {
        this.loadPrerequisites();
        if (currentSale) {
          this.populateForm(currentSale);
        } else {
          this.resetForm();
        }
      }
    });
  }

  ngOnInit() {
    this.loadPrerequisites();
  }

  private initForm() {
    const today = new Date().toISOString();
    this.form = this.fb.group({
      customerId: [null],
      saleDate: [today, Validators.required],
      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  private loadPrerequisites() {
    this.productService.loadProducts({ page: 0, size: 100 });
    this.customerService.loadCustomers({ page: 0, size: 100 });
  }

  private resetForm() {
    const today = new Date().toISOString();
    this.form.reset({
      customerId: null,
      saleDate: today
    });
    this.items.clear();
    this.addItem();
  }

  private populateForm(sale: SaleDetail) {
    this.form.patchValue({
      customerId: sale.customerId || null,
      saleDate: sale.saleDate || new Date().toISOString()
    });

    this.items.clear();
    if (sale.items && sale.items.length > 0) {
      sale.items.forEach(item => {
        this.items.push(
          this.fb.group({
            saleDetailId: [item.saleDetailId],
            productId: [item.productId, Validators.required],
            quantity: [item.quantity, [Validators.required, Validators.min(1)]],
            unitPrice: [item.unitPrice || 0],
            subTotal: [item.subTotal || 0]
          })
        );
      });
    } else {
      this.addItem();
    }
  }

  addItem() {
    const itemGroup = this.fb.group({
      saleDetailId: [null],
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0],
      subTotal: [0]
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onProductSelect(index: number, productId: number) {
    const product = this.productService.products().find(p => p.productId === productId);
    const itemGroup = this.items.at(index);
    if (product) {
      const price = product.sellingPrice || 0;
      const qty = itemGroup.get('quantity')?.value || 1;
      itemGroup.patchValue({
        productId: product.productId,
        unitPrice: price,
        subTotal: price * qty
      });
    }
  }

  onQuantityChange(index: number) {
    const itemGroup = this.items.at(index);
    const qty = Number(itemGroup.get('quantity')?.value) || 0;
    const price = Number(itemGroup.get('unitPrice')?.value) || 0;
    itemGroup.patchValue({
      subTotal: qty * price
    });
  }

  getProductStock(productId: number): number {
    const p = this.productService.products().find(item => item.productId === productId);
    return p?.stockQuantity ?? 0;
  }

  calculateTotal(): number {
    return this.items.controls.reduce((sum, control) => {
      return sum + (Number(control.get('subTotal')?.value) || 0);
    }, 0);
  }

  onSubmit() {
    if (this.form.invalid || this.items.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const formVal = this.form.value;
    const itemsPayload = formVal.items.map((it: any) => ({
      productId: Number(it.productId),
      quantity: Number(it.quantity)
    }));

    if (this.sale()) {
      const updateData: UpdateSaleRequest = {
        customerId: formVal.customerId ? Number(formVal.customerId) : null,
        saleDate: formVal.saleDate,
        items: formVal.items.map((it: any) => ({
          saleDetailId: it.saleDetailId || undefined,
          productId: Number(it.productId),
          quantity: Number(it.quantity)
        }))
      };

      this.saleService.updateSale(this.sale()!.saleId, updateData).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal();
        }
      });
    } else {
      const createData: CreateSaleRequest = {
        customerId: formVal.customerId ? Number(formVal.customerId) : null,
        saleDate: formVal.saleDate,
        items: itemsPayload
      };

      this.saleService.createSale(createData).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal();
        }
      });
    }
  }

  closeModal() {
    this.close.emit();
  }
}
