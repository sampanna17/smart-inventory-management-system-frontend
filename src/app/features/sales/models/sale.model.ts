export enum SaleStatus {
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface SaleDetailItem {
  saleDetailId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface SaleSummary {
  saleId: number;
  invoiceNumber: string;
  customerId?: number;
  customerName?: string;
  userId?: number;
  userName?: string;
  saleDate: string;
  totalAmount: number;
  status: SaleStatus;
  createdAt: string;
}

export interface SaleDetail {
  saleId: number;
  invoiceNumber: string;
  customerId?: number;
  customerName?: string;
  userId?: number;
  userName?: string;
  saleDate: string;
  totalAmount: number;
  status: SaleStatus;
  createdAt: string;
  items: SaleDetailItem[];
}

export type SaleResponse = SaleDetail;

export interface CreateSaleDetailRequest {
  productId: number;
  quantity: number;
}

export interface CreateSaleRequest {
  customerId?: number | null;
  saleDate: string;
  items: CreateSaleDetailRequest[];
}

export interface UpdateSaleDetailRequest {
  saleDetailId?: number;
  productId: number;
  quantity: number;
}

export interface UpdateSaleRequest {
  customerId?: number | null;
  saleDate: string;
  items: UpdateSaleDetailRequest[];
}

export interface UpdateSaleStatusRequest {
  status: SaleStatus;
}
