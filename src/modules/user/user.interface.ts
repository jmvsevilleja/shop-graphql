export interface IUser {
    id: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
  }