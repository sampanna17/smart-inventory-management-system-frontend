import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/notifications`;

export const NOTIFICATION_API = {
  BASE,
  CREATE: `${BASE}/create`,
  BROADCAST: `${BASE}/broadcast`,
  GET_ALL: BASE,
  MARK_AS_READ: (id: number) => `${BASE}/${id}/read`,
  MARK_ALL_AS_READ: `${BASE}/read-all`,
  DELETE: (id: number) => `${BASE}/${id}`,
  DELETE_ALL: `${BASE}/delete-all`,
  UNREAD_COUNT: `${BASE}/unread-count`,
} as const;
