import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/product-suppliers`;

export const PRODUCT_SUPPLIER_API = {
  ADD: (productId: number | string, supplierId: number | string) =>
    `${BASE}/products/${productId}/suppliers/${supplierId}`,

  REMOVE: (productId: number | string, supplierId: number | string) =>
    `${BASE}/products/${productId}/suppliers/${supplierId}`,

  GET_SUPPLIERS_BY_PRODUCT: (productId: number | string) =>
    `${BASE}/products/${productId}/suppliers`,

  GET_PRODUCTS_BY_SUPPLIER: (supplierId: number | string) =>
    `${BASE}/suppliers/${supplierId}/products`,
} as const;
