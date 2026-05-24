export type UserRole = 'customer' | 'admin';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
