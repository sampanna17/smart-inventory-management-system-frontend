import { environment } from '../../../../environments/environment';

const BASE_URL = `${environment.apiUrl}/reports`;

export const REPORT_API = {
  BASE: BASE_URL,
  SALES: `${BASE_URL}/sales`,
  INVENTORY: `${BASE_URL}/inventory`,
  PURCHASES: `${BASE_URL}/purchases`,
  ANALYTICS_PRODUCTS: `${BASE_URL}/analytics/products`,
  ANALYTICS_CUSTOMERS: `${BASE_URL}/analytics/customers`,
  STAFF: `${BASE_URL}/staff`,
  EXPORT_SALES: `${BASE_URL}/sales/export`,
  EXPORT_INVENTORY: `${BASE_URL}/inventory/export`,
  EXPORT_PURCHASES: `${BASE_URL}/purchases/export`,
};
