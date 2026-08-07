import { SupplierSummary } from './supplier.model';

export interface Product {
  productId: number;
  productName: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  categoryId: number;
  categoryName?: string;
  unitId: number;
  unitName?: string;
  createdAt?: string;
  updatedAt?: string;
  images?: ProductImage[];
  primaryImageUrl?: string;
  suppliers?: SupplierSummary[];
}

export interface ProductImage {
  imageId: number;
  productId: number;
  imageURL: string;
  publicId: string;
}
