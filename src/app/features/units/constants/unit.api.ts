import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/units`;

export const UNIT_API = {
  GET_ALL: BASE,
  CREATE: `${BASE}/create`,
  UPDATE: (id: string | number) => `${BASE}/update/${id}`,
  DELETE: (id: string | number) => `${BASE}/${id}`,
} as const;
