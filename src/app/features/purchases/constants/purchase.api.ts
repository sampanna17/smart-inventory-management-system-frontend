import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/purchases`;

export const PURCHASE_API = {
  GET_ALL: BASE,
  GET_BY_ID: (id: string | number) => `${BASE}/${id}`,
  CREATE: `${BASE}/create`,
  UPDATE: (id: string | number) => `${BASE}/update/${id}`,
  DELETE: (id: string | number) => `${BASE}/${id}`,
  UPDATE_STATUS: (id: string | number) => `${BASE}/${id}/status`,
  GET_BY_SUPPLIER: (supplierId: string | number) => `${BASE}/supplier/${supplierId}`,
  GET_PRODUCTS_BY_SUPPLIER: (supplierId: string | number) =>
    `${environment.apiUrl}/product-suppliers/suppliers/${supplierId}/products`,
} as const;
