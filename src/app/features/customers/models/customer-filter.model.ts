export interface CustomerFilterParams {
  search?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
