import { SaleStatus } from '../../sales/models/sale.model';
import { PurchaseStatus } from '../../purchases/models/purchase.model';

export interface SalesReportFilterParams {
  startDate?: string;
  endDate?: string;
  customerId?: number;
  userId?: number;
  status?: SaleStatus | 'ALL';
  groupBy?: 'DAY' | 'MONTH' | 'YEAR';
}

export interface InventoryReportFilterParams {
  categoryId?: number;
  stockStatus?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  search?: string;
  movementStartDate?: string;
  movementEndDate?: string;
}

export interface PurchaseReportFilterParams {
  startDate?: string;
  endDate?: string;
  supplierId?: number;
  status?: PurchaseStatus | 'ALL';
}

export interface AnalyticsFilterParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// Sales Report Response Models
export interface SalesPeriodData {
  period: string;
  salesCount: number;
  revenue: number;
  unitsSold: number;
}

export interface SalesReportSummary {
  totalRevenue: number;
  totalSalesCount: number;
  totalUnitsSold: number;
  averageOrderValue: number;
  completedSalesCount: number;
  refundedSalesCount: number;
  cancelledSalesCount: number;
}

export interface SalesReportItem {
  saleId: number;
  invoiceNumber: string;
  customerId?: number;
  customerName: string;
  userId: number;
  userName: string;
  saleDate: string;
  totalAmount: number;
  status: SaleStatus;
  totalItems: number;
}

export interface SalesReportResponse {
  summary: SalesReportSummary;
  periodBreakdown: SalesPeriodData[];
  sales: SalesReportItem[];
}

// Inventory Report Response Models
export interface InventoryReportSummary {
  totalProductsCount: number;
  totalUnitsInStock: number;
  totalCostValue: number;
  totalRetailValue: number;
  totalPotentialProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface CategoryInventorySummary {
  categoryId?: number;
  categoryName: string;
  productCount: number;
  totalUnitsInStock: number;
  totalCostValue: number;
  totalRetailValue: number;
}

export interface MovementSummary {
  totalPurchasedQty: number;
  totalSoldQty: number;
  totalAdjustedQty: number;
  totalReturnedQty: number;
}

export interface InventoryReportItem {
  productId: number;
  productName: string;
  categoryId?: number;
  categoryName: string;
  unitName: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  totalCostValue: number;
  totalRetailValue: number;
  potentialProfit: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface InventoryReportResponse {
  summary: InventoryReportSummary;
  categoryBreakdown: CategoryInventorySummary[];
  movementSummary: MovementSummary;
  items: InventoryReportItem[];
}

// Purchase Report Response Models
export interface PurchaseReportSummary {
  totalPurchasesCount: number;
  totalExpenditure: number;
  receivedCount: number;
  pendingCount: number;
  cancelledCount: number;
}

export interface SupplierPurchaseSummary {
  supplierId?: number;
  supplierName: string;
  contactPerson: string;
  purchaseCount: number;
  totalAmount: number;
  receivedCount: number;
}

export interface PurchaseReportItem {
  purchaseId: number;
  purchaseNumber: string;
  supplierId?: number;
  supplierName: string;
  userId: number;
  userName: string;
  purchaseDate: string;
  totalAmount: number;
  status: PurchaseStatus;
  totalItems: number;
}

export interface PurchaseReportResponse {
  summary: PurchaseReportSummary;
  supplierBreakdown: SupplierPurchaseSummary[];
  purchases: PurchaseReportItem[];
}

// Product & Customer Analytics Models
export interface ProductPerformanceData {
  productId: number;
  productName: string;
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  currentStock: number;
}

export interface CategoryPerformanceData {
  categoryId?: number;
  categoryName: string;
  totalItemsSold: number;
  totalRevenue: number;
  revenuePercentage: number;
}

export interface ProductAnalyticsResponse {
  topSellingByQuantity: ProductPerformanceData[];
  topSellingByRevenue: ProductPerformanceData[];
  categoryPerformance: CategoryPerformanceData[];
}

export interface CustomerPerformanceData {
  customerId: number;
  customerName: string;
  email?: string;
  phone?: string;
  totalOrders: number;
  totalSpend: number;
  averageOrderValue: number;
  lastOrderDate?: string;
}

export interface CustomerAnalyticsSummary {
  totalCustomers: number;
  activeCustomers: number;
  averageCustomerSpend: number;
}

export interface CustomerAnalyticsResponse {
  summary: CustomerAnalyticsSummary;
  topCustomers: CustomerPerformanceData[];
}

// Staff Performance Models
export interface StaffPerformanceData {
  staffId: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  totalSalesCount: number;
  totalRevenue: number;
  totalUnitsSold: number;
  averageSaleValue: number;
  lastSaleDate?: string;
}

export interface StaffPerformanceReportResponse {
  staffMembers: StaffPerformanceData[];
}
