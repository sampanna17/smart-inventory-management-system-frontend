export interface UserProfile {
  userID: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
}
