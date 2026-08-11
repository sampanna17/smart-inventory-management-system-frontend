import { PurchaseStatus } from './purchase.model';

export interface PurchaseFilterParams {
  search?: string;
  purchaseNumber?: string;
  supplierId?: number;
  status?: PurchaseStatus | string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
