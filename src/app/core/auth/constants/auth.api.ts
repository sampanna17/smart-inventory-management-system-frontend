import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/auth`;

export const AUTH_API = {
  SIGNUP: `${BASE}/signup`,
  LOGIN: `${BASE}/login`,
  LOGIN_GOOGLE: `${BASE}/login/google`,
  FORGOT_PASSWORD: `${BASE}/forgot-password`,
  RESET_PASSWORD: `${BASE}/reset-password`,
  ACTIVATE: `${BASE}/activate`,
  RESEND_ACTIVATE: `${BASE}/resend-activation`,
} as const;
