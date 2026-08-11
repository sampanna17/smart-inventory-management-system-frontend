import { SaleStatus } from './sale.model';

export interface SaleFilterParams {
  search?: string;
  invoiceNumber?: string;
  customerId?: number;
  status?: SaleStatus | string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
