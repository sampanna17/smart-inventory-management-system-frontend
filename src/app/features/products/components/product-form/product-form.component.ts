import { Component, computed, inject, input, output, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../../categories/services/category.service';
import { UnitService } from '../../../units/services/unit.service';
import { Product, ProductImage } from '../../../../core/models/product.model';
import { CreateProductRequest, UpdateProductRequest } from '../../models/product-request.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark, heroPhoto, heroCloudArrowUp, heroTrash, heroPlus, heroArrowPath } from '@ng-icons/heroicons/outline';

import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent, CustomSelectComponent],
  viewProviders: [provideIcons({ heroXMark, heroPhoto, heroCloudArrowUp, heroTrash, heroPlus, heroArrowPath })],
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  isOpen = input<boolean>(false);
  product = input<Product | null>(null);

  close = output<void>();
  saved = output<void>();

  private fb = inject(FormBuilder);
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  unitService = inject(UnitService);

  productForm!: FormGroup;
  initialFormValue: any = null;

  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;

  isEditMode = computed(() => !!this.product());

  ngOnInit() {
    this.initForm();
    this.categoryService.loadCategories();
    this.unitService.loadUnits();
  }

  constructor() {
    effect(() => {
      const p = this.product();
      const open = this.isOpen();
      if (open) {
        setTimeout(() => {
          this.selectedFile = null;
          this.imagePreviewUrl = null;

          if (p) {
            this.productService.loadProductImages(p.productId);
            if (this.productForm) {
              this.productForm.patchValue({
                productName: p.productName,
                categoryId: p.categoryId,
                unitId: p.unitId,
                costPrice: p.costPrice,
                sellingPrice: p.sellingPrice,
                stockQuantity: p.stockQuantity,
                reorderLevel: p.reorderLevel,
                description: p.description || ''
              });
              this.productForm.get('stockQuantity')?.disable();
            }
          } else {
            this.productService.clearProductImages();
            if (this.productForm) {
              this.productForm.reset({
                productName: '',
                categoryId: '',
                unitId: '',
                costPrice: 0,
                sellingPrice: 0,
                stockQuantity: 0,
                reorderLevel: 5,
                description: ''
              });
              this.productForm.get('stockQuantity')?.enable();
            }
          }
          this.initialFormValue = this.productForm?.getRawValue();
        });
      } else {
        this.productService.clearProductImages();
      }
    });
  }

  private initForm() {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/.*\S.*/)]],
      categoryId: ['', [Validators.required]],
      unitId: ['', [Validators.required]],
      costPrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      reorderLevel: [5, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        return;
      }
      this.selectedFile = file;
      this.imagePreviewUrl = URL.createObjectURL(file);
    }
  }

  removeSelectedFile() {
    this.selectedFile = null;
    this.imagePreviewUrl = null;
  }

  deleteExistingImage(img: ProductImage) {
    const p = this.product();
    if (p && img) {
      this.productService.deleteImage(p.productId, img.imageId).subscribe();
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.productForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasChanges(): boolean {
    if (this.selectedFile) return true;
    if (!this.initialFormValue) return true;
    return JSON.stringify(this.initialFormValue) !== JSON.stringify(this.productForm.getRawValue());
  }

  closeModal(force = false) {
    if (!force && this.productService.isSubmitting()) return;
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.productForm.reset();
    this.close.emit();
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formVal = this.productForm.getRawValue();

    if (this.isEditMode() && this.product()) {
      const updateReq: UpdateProductRequest = {
        categoryId: Number(formVal.categoryId),
        unitId: Number(formVal.unitId),
        productName: formVal.productName.trim(),
        description: formVal.description ? formVal.description.trim() : undefined,
        costPrice: Number(formVal.costPrice),
        sellingPrice: Number(formVal.sellingPrice),
        reorderLevel: Number(formVal.reorderLevel)
      };

      this.productService.updateProduct(this.product()!.productId, updateReq, this.selectedFile).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal(true);
        }
      });
    } else {
      const createReq: CreateProductRequest = {
        categoryId: Number(formVal.categoryId),
        unitId: Number(formVal.unitId),
        productName: formVal.productName.trim(),
        description: formVal.description ? formVal.description.trim() : undefined,
        costPrice: Number(formVal.costPrice),
        sellingPrice: Number(formVal.sellingPrice),
        stockQuantity: Number(formVal.stockQuantity),
        reorderLevel: Number(formVal.reorderLevel)
      };

      this.productService.createProduct(createReq, this.selectedFile).subscribe({
        next: () => {
          this.saved.emit();
          this.closeModal(true);
        }
      });
    }
  }
}
