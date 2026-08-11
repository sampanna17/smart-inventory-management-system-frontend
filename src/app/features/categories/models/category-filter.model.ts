export interface CategoryFilterParams {
  search?: string;
  categoryName?: string;
  description?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
