export interface Supplier {
  supplierID: number;
  supplierName: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierSummary {
  supplierId: number;
  supplierName: string;
}

export interface ProductSummary {
  productId: number;
  productName: string;
}

