import { Component, computed, inject, input, output, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { CreateStaffRequest } from '../../models/user-profile.model';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-create-staff-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent, FormErrorComponent],
  viewProviders: [provideIcons({ heroXMark })],
  templateUrl: './create-staff-form.component.html'
})
export class CreateStaffFormComponent implements OnInit {
  isOpen = input<boolean>(false);

  close = output<void>();
  saved = output<void>();

  private fb = inject(FormBuilder);
  userService = inject(UserService);

  staffForm!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open && this.staffForm) {
        setTimeout(() => {
          this.staffForm.reset({
            fullName: '',
            email: ''
          });
        });
      }
    });
  }

  private initForm() {
    this.staffForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  closeModal(force = false) {
    if (!force && this.userService.isSubmitting()) return;
    this.staffForm.reset();
    this.close.emit();
  }

  onSubmit() {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    const formValue = this.staffForm.value;
    const request: CreateStaffRequest = {
      fullName: formValue.fullName.trim(),
      email: formValue.email.trim()
    };

    this.userService.createStaff(request).subscribe({
      next: () => {
        this.saved.emit();
        this.closeModal(true);
      }
    });
  }
}
