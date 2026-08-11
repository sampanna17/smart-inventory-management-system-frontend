import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/products`;

export const PRODUCT_API = {
  GET_ALL: BASE,
  GET_ALL_LIST: `${BASE}/all`,
  GET_BY_ID: (id: number | string) => `${BASE}/${id}`,
  CREATE: `${BASE}/create`,
  UPDATE: (id: number | string) => `${BASE}/update/${id}`,
  DELETE: (id: number | string) => `${BASE}/${id}`,

  IMAGES: {
    UPLOAD: (productId: number | string) => `${BASE}/${productId}/images`,
    GET_ALL: (productId: number | string) => `${BASE}/${productId}/images`,
    DELETE: (productId: number | string, imageId: number | string) => `${BASE}/${productId}/images/${imageId}`,
  }
} as const;
