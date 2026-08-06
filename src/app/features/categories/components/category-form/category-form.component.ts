import { Component, computed, inject, input, output, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../../../core/models/category.model';
import { CreateCategoryRequest, UpdateCategoryRequest } from '../../models/category-request.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  viewProviders: [provideIcons({ heroXMark })],
  templateUrl: './category-form.component.html'
})
export class CategoryFormComponent implements OnInit {
  isOpen = input<boolean>(false);
  category = input<Category | null>(null);

  close = output<void>();
  saved = output<void>();

  private fb = inject(FormBuilder);
  categoryService = inject(CategoryService);

  categoryForm!: FormGroup;
  initialFormValue: any = null;

  isEditMode = computed(() => !!this.category());

  ngOnInit() {
    this.initForm();
  }

  constructor() {
    effect(() => {
      const cat = this.category();
      const open = this.isOpen();
      if (open) {
         // Wait a tick to ensure form is built if first time
         setTimeout(() => {
           if (this.categoryForm) {
             if (cat) {
               this.categoryForm.patchValue({
                 categoryName: cat.categoryName,
                 description: cat.description || ''
               });
             } else {
               this.categoryForm.reset({
                 categoryName: '',
                 description: ''
               });
             }
             this.initialFormValue = this.categoryForm.value;
           }
         });
      }
    });
  }

  private initForm() {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
      description: ['']
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.categoryForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasChanges(): boolean {
    if (!this.initialFormValue) return true;
    return JSON.stringify(this.initialFormValue) !== JSON.stringify(this.categoryForm.value);
  }

  closeModal(force = false) {
    if (!force && this.categoryService.isSubmitting()) return;
    this.categoryForm.reset();
    this.close.emit();
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const formValue = this.categoryForm.value;
    // Trim values
    formValue.categoryName = formValue.categoryName.trim();
    if (formValue.description) formValue.description = formValue.description.trim();

    if (this.isEditMode() && this.category()) {
      const updateReq: UpdateCategoryRequest = formValue;
      this.categoryService.updateCategory(this.category()!.categoryID, updateReq).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal(true);
        }
      });
    } else {
      const createReq: CreateCategoryRequest = formValue;
      this.categoryService.createCategory(createReq).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal(true);
        }
      });
    }
  }
}
