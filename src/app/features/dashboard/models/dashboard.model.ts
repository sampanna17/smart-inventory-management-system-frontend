import { SaleSummary } from '../../sales/models/sale.model';
import { Purchase } from '../../purchases/models/purchase.model';
import { StockMovement } from '../../stock-movement/models/stock-movement.model';
import { NotificationItem } from '../../../core/models/notification.model';

export interface AdminDashboardSummary {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalSales: number;
  totalRevenue: number;
  totalPurchases: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  unreadNotifications: number;
}

export interface TrendDataPoint {
  period: string;
  count: number;
  amount: number;
}

export interface DashboardCharts {
  salesTrend: TrendDataPoint[];
  revenueTrend: TrendDataPoint[];
}

export interface TopSellingProduct {
  productId: number;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface DashboardRecentActivities {
  recentSales: SaleSummary[];
  recentPurchases: Purchase[];
  recentStockMovements: StockMovement[];
}

export interface AdminDashboardResponse {
  summary: AdminDashboardSummary;
  charts: DashboardCharts;
  topSellingProducts: TopSellingProduct[];
  recentActivities: DashboardRecentActivities;
}

export interface StaffDashboardSummary {
  todaySales: number;
  todayRevenue: number;
  productsSoldToday: number;
  lowStockProducts: number;
}

export interface StaffDashboardResponse {
  summary: StaffDashboardSummary;
  recentSales: SaleSummary[];
  notifications: NotificationItem[];
}
