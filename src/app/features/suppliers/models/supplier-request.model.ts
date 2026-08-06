export interface CreateSupplierRequest {
  supplierName: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierRequest {
  supplierName: string;
  phone: string;
  email?: string;
  address?: string;
}
