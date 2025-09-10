import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

export const RBAC = Reflector.createDecorator<UserRole>();