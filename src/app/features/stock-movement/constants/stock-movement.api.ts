import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/stock-movements`;

export const STOCK_MOVEMENT_API = {
  GET_ALL: BASE,
  GET_ALL_LIST: `${BASE}/all`,
  GET_BY_ID: (id: string | number) => `${BASE}/${id}`,
  CREATE: `${BASE}/create`,
  DELETE: (id: string | number) => `${BASE}/${id}`,
  GET_BY_PRODUCT: (productId: string | number) => `${BASE}/product/${productId}`,
  GET_BY_USER: (userId: string | number) => `${BASE}/user/${userId}`,
  GET_BY_TYPE: (type: string) => `${BASE}/type/${type}`,
} as const;
