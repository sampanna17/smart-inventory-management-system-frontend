import { MovementType } from './stock-movement.model';

export interface StockMovementFilterParams {
  search?: string;
  productId?: number;
  userId?: number;
  movementType?: MovementType | string;
  startDate?: string;
  endDate?: string;
  minQuantity?: number;
  maxQuantity?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
