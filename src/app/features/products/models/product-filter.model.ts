export interface ProductFilterParams {
  search?: string;
  categoryId?: number | string;
  unitId?: number | string;
  stockStatus?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
