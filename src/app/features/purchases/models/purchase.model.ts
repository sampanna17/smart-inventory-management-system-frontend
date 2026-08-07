import { PurchaseStatus } from '../../../core/enums/purchase-status.enum';

export { PurchaseStatus };

export interface PurchaseItem {
  purchaseDetailId?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subTotal?: number;
}

export interface Purchase {
  purchaseId: number;
  purchaseNumber: string;
  supplierId: number;
  supplierName: string;
  userId?: number;
  userName?: string;
  purchaseDate: string;
  totalAmount: number;
  status: PurchaseStatus;
  createdAt: string;
  items: PurchaseItem[];
}

export interface PurchaseItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseRequest {
  supplierId: number;
  purchaseDate: string;
  items: PurchaseItemRequest[];
}

export interface UpdatePurchaseRequest {
  supplierId: number;
  purchaseDate: string;
  items: PurchaseItemRequest[];
}

export interface UpdatePurchaseStatusRequest {
  status: PurchaseStatus;
}

export interface SupplierProductSummary {
  productId: number;
  productName: string;
}
