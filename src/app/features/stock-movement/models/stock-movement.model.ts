export enum MovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN'
}

export interface StockMovement {
  movementId: number;
  productId: number;
  productName: string;
  userId?: number;
  userName?: string;
  movementType: MovementType;
  quantity: number;
  movementDate: string;
  remarks?: string;
}

export interface CreateStockMovementRequest {
  productId: number;
  movementType: MovementType;
  quantity: number;
  remarks?: string;
}
