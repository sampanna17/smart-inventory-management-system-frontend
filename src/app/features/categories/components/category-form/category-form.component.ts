import { Component, computed, inject, input, output, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../../../core/models/category.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  viewProviders: [provideIcons({ heroXMark })],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>

        <!-- Modal Panel -->
        <div class="relative w-full max-w-lg transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">

          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
            <h3 class="text-lg font-semibold text-slate-900">
              {{ isEditMode() ? 'Edit Category' : 'Create New Category' }}
            </h3>
            <button
              type="button"
              (click)="closeModal()"
              class="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none transition-colors"
            >
              <ng-icon name="heroXMark" class="text-2xl"></ng-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-6 overflow-y-auto custom-scrollbar flex-1">
            <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" id="category-form" class="space-y-4">

              <!-- Category Name -->
              <div>
                <label for="categoryName" class="block text-sm font-medium text-slate-700 mb-1">
                  Category Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="categoryName"
                  formControlName="categoryName"
                  class="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="e.g., Electronics"
                  [ngClass]="{'ring-red-300 focus:ring-red-500': isFieldInvalid('categoryName')}"
                />
                @if (isFieldInvalid('categoryName')) {
                  <p class="mt-1.5 text-sm text-red-500">Category name is required.</p>
                }
              </div>

              <!-- Description -->
              <div>
                <label for="description" class="block text-sm font-medium text-slate-700 mb-1">
                  Description <span class="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  formControlName="description"
                  rows="3"
                  class="block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 resize-none custom-scrollbar"
                  placeholder="Brief description of the category..."
                ></textarea>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              (click)="closeModal()"
              [disabled]="categoryService.isSubmitting()"
              class="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="category-form"
              [disabled]="categoryForm.invalid || !hasChanges() || categoryService.isSubmitting()"
              class="inline-flex justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (categoryService.isSubmitting()) {
                <span class="inline-block animate-spin mr-2">⟳</span>
              }
              {{ isEditMode() ? 'Save Changes' : 'Create Category' }}
            </button>
          </div>

        </div>
      </div>
    }
  `
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
