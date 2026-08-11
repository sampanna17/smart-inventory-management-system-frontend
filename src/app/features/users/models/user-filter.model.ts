export interface UserFilterParams {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
