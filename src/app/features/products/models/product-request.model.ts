export interface CreateProductRequest {
  categoryId: number;
  unitId: number;
  productName: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  reorderLevel: number;
}

export interface UpdateProductRequest {
  categoryId?: number;
  unitId?: number;
  productName?: string;
  description?: string;
  costPrice?: number;
  sellingPrice?: number;
  reorderLevel?: number;
}
