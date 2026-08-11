import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/sales`;

export const SALE_API = {
  GET_ALL: BASE,
  GET_BY_ID: (id: string | number) => `${BASE}/${id}`,
  CREATE: `${BASE}/create`,
  UPDATE: (id: string | number) => `${BASE}/update/${id}`,
  DELETE: (id: string | number) => `${BASE}/${id}`,
  UPDATE_STATUS: (id: string | number) => `${BASE}/${id}/status`,
  GET_BY_CUSTOMER: (customerId: string | number) => `${BASE}/customer/${customerId}`,
  GET_BY_STATUS: (status: string) => `${BASE}/status/${status}`,
} as const;
