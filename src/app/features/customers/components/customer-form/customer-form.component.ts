import { Component, computed, inject, input, output, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../../../core/models/customer.model';
import { CreateCustomerRequest, UpdateCustomerRequest } from '../../models/customer-request.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  viewProviders: [provideIcons({ heroXMark })],
  templateUrl: './customer-form.component.html'
})
export class CustomerFormComponent implements OnInit {
  isOpen = input<boolean>(false);
  customer = input<Customer | null>(null);

  close = output<void>();
  saved = output<void>();

  private fb = inject(FormBuilder);
  customerService = inject(CustomerService);

  customerForm!: FormGroup;
  initialFormValue: any = null;

  isEditMode = computed(() => !!this.customer());

  ngOnInit() {
    this.initForm();
  }

  constructor() {
    effect(() => {
      const c = this.customer();
      const open = this.isOpen();
      if (open) {
        setTimeout(() => {
          if (this.customerForm) {
            if (c) {
              this.customerForm.patchValue({
                customerName: c.customerName,
                phone: c.phone,
                email: c.email || '',
                address: c.address || ''
              });
            } else {
              this.customerForm.reset({
                customerName: '',
                phone: '',
                email: '',
                address: ''
              });
            }
            this.initialFormValue = this.customerForm.value;
          }
        });
      }
    });
  }

  private initForm() {
    this.customerForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.email]],
      address: ['']
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.customerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasChanges(): boolean {
    if (!this.initialFormValue) return true;
    return JSON.stringify(this.initialFormValue) !== JSON.stringify(this.customerForm.value);
  }

  closeModal(force = false) {
    if (!force && this.customerService.isSubmitting()) return;
    this.customerForm.reset();
    this.close.emit();
  }

  onSubmit() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    const formValue = this.customerForm.value;
    formValue.customerName = formValue.customerName.trim();
    formValue.phone = formValue.phone.trim();
    if (formValue.email) formValue.email = formValue.email.trim();
    if (formValue.address) formValue.address = formValue.address.trim();

    if (this.isEditMode() && this.customer()) {
      const updateReq: UpdateCustomerRequest = formValue;
      this.customerService.updateCustomer(this.customer()!.customerID, updateReq).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal(true);
        }
      });
    } else {
      const createReq: CreateCustomerRequest = formValue;
      this.customerService.createCustomer(createReq).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal(true);
        }
      });
    }
  }
}
