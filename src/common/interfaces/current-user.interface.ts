export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface ICurrentUser {
  _id: string;
  email: string;
  name?: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Helper functions for role checking
export const isAdmin = (user: ICurrentUser): boolean => {
  return user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN);
};

export const isSuperAdmin = (user: ICurrentUser): boolean => {
  return user.roles.includes(UserRole.SUPER_ADMIN);
};

// Add these at the bottom of the file

export type AdminUser = ICurrentUser & {
  roles: (UserRole.ADMIN | UserRole.SUPER_ADMIN)[];
};

export type SuperAdminUser = ICurrentUser & {
  roles: UserRole.SUPER_ADMIN[];
};

// Type guards
export const isAdminUser = (user: ICurrentUser): user is AdminUser => {
  return isAdmin(user);
};

export const isSuperAdminUser = (user: ICurrentUser): user is SuperAdminUser => {
  return isSuperAdmin(user);
};

// Helper type for protected routes
export type ProtectedRouteUser = ICurrentUser & {
  isActive: true;
};