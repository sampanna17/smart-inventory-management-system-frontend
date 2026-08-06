import { Component, computed, inject, input, output, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupplierService } from '../../services/supplier.service';
import { Supplier } from '../../../../core/models/supplier.model';
import { CreateSupplierRequest, UpdateSupplierRequest } from '../../models/supplier-request.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  viewProviders: [provideIcons({ heroXMark })],
  templateUrl: './supplier-form.component.html'
})
export class SupplierFormComponent implements OnInit {
  isOpen = input<boolean>(false);
  supplier = input<Supplier | null>(null);

  close = output<void>();
  saved = output<void>();

  private fb = inject(FormBuilder);
  supplierService = inject(SupplierService);

  supplierForm!: FormGroup;
  initialFormValue: any = null;

  isEditMode = computed(() => !!this.supplier());

  ngOnInit() {
    this.initForm();
  }

  constructor() {
    effect(() => {
      const s = this.supplier();
      const open = this.isOpen();
      if (open) {
        setTimeout(() => {
          if (this.supplierForm) {
            if (s) {
              this.supplierForm.patchValue({
                supplierName: s.supplierName,
                phone: s.phone,
                email: s.email || '',
                address: s.address || ''
              });
            } else {
              this.supplierForm.reset({
                supplierName: '',
                phone: '',
                email: '',
                address: ''
              });
            }
            this.initialFormValue = this.supplierForm.value;
          }
        });
      }
    });
  }

  private initForm() {
    this.supplierForm = this.fb.group({
      supplierName: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
      phone: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
      email: ['', [Validators.email]],
      address: ['']
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.supplierForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasChanges(): boolean {
    if (!this.initialFormValue) return true;
    return JSON.stringify(this.initialFormValue) !== JSON.stringify(this.supplierForm.value);
  }

  closeModal(force = false) {
    if (!force && this.supplierService.isSubmitting()) return;
    this.supplierForm.reset();
    this.close.emit();
  }

  onSubmit() {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    const formValue = this.supplierForm.value;
    formValue.supplierName = formValue.supplierName.trim();
    formValue.phone = formValue.phone.trim();
    if (formValue.email) formValue.email = formValue.email.trim();
    if (formValue.address) formValue.address = formValue.address.trim();

    if (this.isEditMode() && this.supplier()) {
      const updateReq: UpdateSupplierRequest = formValue;
      this.supplierService.updateSupplier(this.supplier()!.supplierID, updateReq).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal(true);
        }
      });
    } else {
      const createReq: CreateSupplierRequest = formValue;
      this.supplierService.createSupplier(createReq).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal(true);
        }
      });
    }
  }
}
