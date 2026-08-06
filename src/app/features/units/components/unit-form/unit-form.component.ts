import { Component, computed, inject, input, output, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UnitService } from '../../services/unit.service';
import { Unit } from '../../../../core/models/unit.model';
import { CreateUnitRequest, UpdateUnitRequest } from '../../models/unit-request.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  viewProviders: [provideIcons({ heroXMark })],
  templateUrl: './unit-form.component.html'
})
export class UnitFormComponent implements OnInit {
  isOpen = input<boolean>(false);
  unit = input<Unit | null>(null);

  close = output<void>();
  saved = output<void>();

  private fb = inject(FormBuilder);
  unitService = inject(UnitService);

  unitForm!: FormGroup;
  initialFormValue: any = null;

  isEditMode = computed(() => !!this.unit());

  ngOnInit() {
    this.initForm();
  }

  constructor() {
    effect(() => {
      const u = this.unit();
      const open = this.isOpen();
      if (open) {
         // Wait a tick to ensure form is built if first time
         setTimeout(() => {
           if (this.unitForm) {
             if (u) {
               this.unitForm.patchValue({
                 unitName: u.unitName
               });
             } else {
               this.unitForm.reset({
                 unitName: ''
               });
             }
             this.initialFormValue = this.unitForm.value;
           }
         });
      }
    });
  }

  private initForm() {
    this.unitForm = this.fb.group({
      unitName: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.unitForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasChanges(): boolean {
    if (!this.initialFormValue) return true;
    return JSON.stringify(this.initialFormValue) !== JSON.stringify(this.unitForm.value);
  }

  closeModal(force = false) {
    if (!force && this.unitService.isSubmitting()) return;
    this.unitForm.reset();
    this.close.emit();
  }

  onSubmit() {
    if (this.unitForm.invalid) {
      this.unitForm.markAllAsTouched();
      return;
    }

    const formValue = this.unitForm.value;
    // Trim values
    formValue.unitName = formValue.unitName.trim();

    if (this.isEditMode() && this.unit()) {
      const updateReq: UpdateUnitRequest = formValue;
      this.unitService.updateUnit(this.unit()!.unitId, updateReq).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal(true);
        }
      });
    } else {
      const createReq: CreateUnitRequest = formValue;
      this.unitService.createUnit(createReq).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal(true);
        }
      });
    }
  }
}
