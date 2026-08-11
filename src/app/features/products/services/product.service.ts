import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/page-response.model';
import { Product, ProductImage } from '../../../core/models/product.model';
import { CreateProductRequest, UpdateProductRequest } from '../models/product-request.model';
import { ProductFilterParams } from '../models/product-filter.model';
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
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0); // 0-based
  pageSize = signal<number>(10);
  isFirst = signal<boolean>(true);
  isLast = signal<boolean>(true);
  hasNext = signal<boolean>(false);
  hasPrevious = signal<boolean>(false);

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

  loadProducts(params?: ProductFilterParams): void {
    this.isLoading.set(true);
    this.error.set(null);

    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined && params.page !== null) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.size !== undefined && params.size !== null) {
        httpParams = httpParams.set('size', params.size.toString());
      }
      if (params.sortBy) {
        httpParams = httpParams.set('sortBy', params.sortBy);
      }
      if (params.sortDir) {
        httpParams = httpParams.set('sortDir', params.sortDir);
      }
      if (params.search && params.search.trim()) {
        httpParams = httpParams.set('search', params.search.trim());
      }
      if (params.categoryId && params.categoryId !== 'all') {
        httpParams = httpParams.set('categoryId', params.categoryId.toString());
      }
      if (params.unitId && params.unitId !== 'all') {
        httpParams = httpParams.set('unitId', params.unitId.toString());
      }
      if (params.stockStatus && params.stockStatus !== 'all') {
        httpParams = httpParams.set('stockStatus', params.stockStatus);
      }
      if (params.minPrice !== undefined && params.minPrice !== null) {
        httpParams = httpParams.set('minPrice', params.minPrice.toString());
      }
      if (params.maxPrice !== undefined && params.maxPrice !== null) {
        httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
      }
      if (params.minStock !== undefined && params.minStock !== null) {
        httpParams = httpParams.set('minStock', params.minStock.toString());
      }
      if (params.maxStock !== undefined && params.maxStock !== null) {
        httpParams = httpParams.set('maxStock', params.maxStock.toString());
      }
    }

    this.http.get<ApiResponse<PageResponse<Product>>>(PRODUCT_API.GET_ALL, { params: httpParams })
      .pipe(
        switchMap(res => {
          if (!res.success || !res.data || !res.data.content || res.data.content.length === 0) {
            const pageData = res.data ?? null;
            return of({ pageData, enrichedProducts: [] as Product[] });
          }

          const pageData = res.data;
          const productList = pageData.content;

          // Concurrently load images for all products to enrich thumbnails
          const imageRequests = productList.map(prod =>
            this.http.get<ProductImage[]>(PRODUCT_API.IMAGES.GET_ALL(prod.productId)).pipe(
              catchError(() => of([] as ProductImage[]))
            )
          );

          return forkJoin(imageRequests).pipe(
            map(imageLists => {
              const enriched = productList.map((prod, index) => {
                const images = imageLists[index] || [];
                return {
                  ...prod,
                  images: images,
                  primaryImageUrl: images.length > 0 ? images[0].imageURL : undefined
                };
              });
              return { pageData, enrichedProducts: enriched };
            })
          );
        }),
        finalize(() => this.isLoading.set(false)),
        catchError(err => {
          this.error.set(err.error?.message || 'Failed to load products');
          this.toastr.error('Failed to load products');
          return of({ pageData: null, enrichedProducts: [] as Product[] });
        })
      )
      .subscribe(({ pageData, enrichedProducts }) => {
        this.products.set(enrichedProducts);
        if (pageData) {
          this.totalElements.set(pageData.totalElements);
          this.totalPages.set(pageData.totalPages);
          this.currentPage.set(pageData.pageNumber);
          this.pageSize.set(pageData.pageSize);
          this.isFirst.set(pageData.first);
          this.isLast.set(pageData.last);
          this.hasNext.set(pageData.hasNext);
          this.hasPrevious.set(pageData.hasPrevious);
        } else {
          this.totalElements.set(0);
          this.totalPages.set(0);
          this.isFirst.set(true);
          this.isLast.set(true);
          this.hasNext.set(false);
          this.hasPrevious.set(false);
        }
      });
  }

  getAllProductsList(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(PRODUCT_API.GET_ALL_LIST);
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
          this.productImages.update(imgs => [...imgs, res.data]);
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
          this.loadProductSuppliers(productId);
        }
      }),
      catchError(err => {
        this.toastr.error(err.error?.message || 'Failed to remove supplier');
        return throwError(() => err);
      })
    );
  }
}
