import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../interfaces/current-user.interface';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);