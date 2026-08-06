import { Role } from '../auth/enums/role.enum';

export interface User {
  userId?: number;
  fullName: string;
  email: string;
  role: Role | string;
  token?: string;
}
