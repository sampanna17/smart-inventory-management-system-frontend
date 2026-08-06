import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/users`;

export const USER_API = {
  BY_ID: (id: string | number) => `${BASE}/${id}`,
  UPDATE_PROFILE: `${BASE}/update-profile`,
} as const;
