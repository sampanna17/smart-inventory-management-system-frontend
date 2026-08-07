import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Product, ProductImage } from '../../../core/models/product.model';
import { CreateProductRequest, UpdateProductRequest } from '../models/product-request.model';
import { PRODUCT_API } from '../constants/product.api';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';

import { PRODUCT_SUPPLIER_API } from '../constants/product-supplier.api';
import { SupplierSummary } from '../../../core/models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // State
  products = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);
  productImages = signal<ProductImage[]>([]);
  assignedSuppliers = signal<SupplierSummary[]>([]);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isUploadingImage = signal<boolean>(false);
  isLoadingImages = signal<boolean>(false);
  isLoadingSuppliers = signal<boolean>(false);
  deletingImageId = signal<number | null>(null);
  error = signal<string | null>(null);

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<ApiResponse<Product[]>>(PRODUCT_API.GET_ALL)
      .pipe(
        switchMap(res => {
          if (!res.success || !res.data || res.data.length === 0) {
            return of([]);
          }
          const productList = res.data;
          // Concurrently load images for all products to enrich thumbnails
          const imageRequests = productList.map(prod =>
            this.http.get<ProductImage[]>(PRODUCT_API.IMAGES.GET_ALL(prod.productId)).pipe(
              catchError(() => of([] as ProductImage[]))
            )
          );

          return forkJoin(imageRequests).pipe(
            map(imageLists => {
              return productList.map((prod, index) => {
                const images = imageLists[index] || [];
                return {
                  ...prod,
                  images: images,
                  primaryImageUrl: images.length > 0 ? images[0].imageURL : undefined
                };
              });
            })
          );
        }),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load products');
          this.toastr.error('Failed to load products');
          return of([]);
        })
      )
      .subscribe(productsWithImages => {
        this.products.set(productsWithImages);
      });
  }

  getProductById(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(PRODUCT_API.GET_BY_ID(id));
  }

  createProduct(data: CreateProductRequest, imageFile?: File | null): Observable<ApiResponse<Product>> {
    this.isSubmitting.set(true);

    return this.http.post<ApiResponse<Product>>(PRODUCT_API.CREATE, data).pipe(
      switchMap(res => {
        if (res.success && res.data && imageFile) {
          return this.uploadImage(res.data.productId, imageFile, false).pipe(
            map(imgRes => {
              const createdProduct = {
                ...res.data,
                images: imgRes.data ? [imgRes.data] : [],
                primaryImageUrl: imgRes.data?.imageURL
              };
              return { ...res, data: createdProduct };
            }),
            catchError(() => of(res))
          );
        }
        return of(res);
      }),
      finalize(() => this.isSubmitting.set(false)),
      tap(res => {
        if (res.success) {
          this.products.update(prods => [res.data, ...prods]);
          this.toastr.success(res.message || 'Product created successfully');
        }
      }),
      catchError(err => {
        this.toastr.error(err.error?.message || 'Failed to create product');
        return throwError(() => err);
      })
    );
  }

  updateProduct(id: number, data: UpdateProductRequest, imageFile?: File | null): Observable<ApiResponse<Product>> {
    this.isSubmitting.set(true);

    return this.http.put<ApiResponse<Product>>(PRODUCT_API.UPDATE(id), data).pipe(
      switchMap(res => {
        if (res.success && res.data && imageFile) {
          return this.uploadImage(id, imageFile, false).pipe(
            map(imgRes => {
              const updatedProduct = {
                ...res.data,
                primaryImageUrl: imgRes.data?.imageURL || res.data.primaryImageUrl
              };
              return { ...res, data: updatedProduct };
            }),
            catchError(() => of(res))
          );
        }
        return of(res);
      }),
      finalize(() => this.isSubmitting.set(false)),
      tap(res => {
        if (res.success) {
          this.products.update(prods =>
            prods.map(p => (p.productId === id ? { ...p, ...res.data } : p))
          );
          this.toastr.success(res.message || 'Product updated successfully');
        }
      }),
      catchError(err => {
        this.toastr.error(err.error?.message || 'Failed to update product');
        return throwError(() => err);
      })
    );
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    this.isSubmitting.set(true);

    return this.http.delete<ApiResponse<void>>(PRODUCT_API.DELETE(id)).pipe(
      finalize(() => this.isSubmitting.set(false)),
      tap(res => {
        if (res.success) {
          this.products.update(prods => prods.filter(p => p.productId !== id));
          this.toastr.success(res.message || 'Product deleted successfully');
        }
      }),
      catchError(err => {
        this.toastr.error(err.error?.message || 'Failed to delete product');
        return throwError(() => err);
      })
    );
  }

  uploadImage(productId: number, file: File, showToast: boolean = true): Observable<ApiResponse<ProductImage>> {
    this.isUploadingImage.set(true);
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<ProductImage>>(PRODUCT_API.IMAGES.UPLOAD(productId), formData).pipe(
      finalize(() => this.isUploadingImage.set(false)),
      tap(res => {
        if (res.success && res.data) {
          if (showToast) {
            this.toastr.success(res.message || 'Image uploaded successfully');
          }
          // Update local state image list
          this.productImages.update(imgs => [...imgs, res.data]);
          // Update product thumbnail in main product list
          this.products.update(prods =>
            prods.map(p => {
              if (p.productId === productId) {
                const currentImages = p.images || [];
                const newImages = [...currentImages, res.data];
                return {
                  ...p,
                  images: newImages,
                  primaryImageUrl: newImages[0]?.imageURL
                };
              }
              return p;
            })
          );
        }
      }),
      catchError(err => {
        this.toastr.error(err.error?.message || 'Failed to upload image');
        return throwError(() => err);
      })
    );
  }

  loadProductImages(productId: number): void {
    this.isLoadingImages.set(true);
    this.productImages.set([]);
    this.http.get<ProductImage[]>(PRODUCT_API.IMAGES.GET_ALL(productId)).pipe(
      finalize(() => this.isLoadingImages.set(false)),
      catchError(() => of([] as ProductImage[]))
    ).subscribe(images => {
      this.productImages.set(images);
    });
  }

  clearProductImages(): void {
    this.productImages.set([]);
  }

  deleteImage(productId: number, imageId: number): Observable<ApiResponse<ProductImage>> {
    this.deletingImageId.set(imageId);
    return this.http.delete<ApiResponse<ProductImage>>(PRODUCT_API.IMAGES.DELETE(productId, imageId)).pipe(
      finalize(() => this.deletingImageId.set(null)),
      tap(res => {
        if (res.success) {
          this.toastr.success(res.message || 'Image deleted successfully');
          this.productImages.update(imgs => imgs.filter(i => i.imageId !== imageId));
          // Update product thumbnail in main product list
          this.products.update(prods =>
            prods.map(p => {
              if (p.productId === productId) {
                const updatedImages = (p.images || []).filter(i => i.imageId !== imageId);
                return {
                  ...p,
                  images: updatedImages,
                  primaryImageUrl: updatedImages.length > 0 ? updatedImages[0].imageURL : undefined
                };
              }
              return p;
            })
          );
        }
      }),
      catchError(err => {
        this.toastr.error(err.error?.message || 'Failed to delete image');
        return throwError(() => err);
      })
    );
  }

  // Product Supplier Relationship methods
  loadProductSuppliers(productId: number): void {
    this.isLoadingSuppliers.set(true);
    this.assignedSuppliers.set([]);
    this.http.get<ApiResponse<SupplierSummary[]>>(PRODUCT_SUPPLIER_API.GET_SUPPLIERS_BY_PRODUCT(productId)).pipe(
      finalize(() => this.isLoadingSuppliers.set(false)),
      catchError(() => of({ success: false, data: [] as SupplierSummary[] } as ApiResponse<SupplierSummary[]>))
    ).subscribe(res => {
      if (res.success && res.data) {
        this.assignedSuppliers.set(res.data);
      }
    });
  }

  assignSupplierToProduct(productId: number, supplierId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(PRODUCT_SUPPLIER_API.ADD(productId, supplierId), {}).pipe(
      tap(res => {
        if (res.success) {
          this.toastr.success(res.message || 'Supplier assigned successfully');
          this.loadProductSuppliers(productId);
        }
      }),
      catchError(err => {
        this.toastr.error(err.error?.message || 'Failed to assign supplier');
        return throwError(() => err);
      })
    );
  }

  removeSupplierFromProduct(productId: number, supplierId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(PRODUCT_SUPPLIER_API.REMOVE(productId, supplierId)).pipe(
      tap(res => {
        if (res.success) {
          this.toastr.success(res.message || 'Supplier removed successfully');
          this.assignedSuppliers.update(sups => sups.filter(s => s.supplierId !== supplierId));
        }
      }),
      catchError(err => {
        this.toastr.error(err.error?.message || 'Failed to remove supplier');
        return throwError(() => err);
      })
    );
  }
}

