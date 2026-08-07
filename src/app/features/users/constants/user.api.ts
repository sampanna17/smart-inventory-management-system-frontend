import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/users`;

export const USER_API = {
  GET_ALL: BASE,
  BY_ID: (id: string | number) => `${BASE}/${id}`,
  CREATE_STAFF: `${BASE}/create-staff`,
  UPDATE_PROFILE: `${BASE}/update-profile`,
  DELETE_STAFF: (id: string | number) => `${BASE}/staff/${id}`,
  ACTIVATE_STAFF: (id: string | number) => `${BASE}/staff/${id}/activate`,
  DEACTIVATE_STAFF: (id: string | number) => `${BASE}/staff/${id}/deactivate`,
} as const;
