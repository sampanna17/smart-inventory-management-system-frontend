export interface SupplierFilterParams {
  search?: string;
  supplierName?: string;
  email?: string;
  phone?: string;
  address?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
