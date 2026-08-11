import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/customers`;

export const CUSTOMER_API = {
  GET_ALL: BASE,
  GET_ALL_LIST: `${BASE}/all`,
  CREATE: `${BASE}/create`,
  UPDATE: (id: string | number) => `${BASE}/update/${id}`,
  DELETE: (id: string | number) => `${BASE}/${id}`,
} as const;
