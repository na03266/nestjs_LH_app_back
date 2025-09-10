import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RBAC } from '../decorator/rbac.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {
  }

  canActivate(context: ExecutionContext): boolean {
    // 만약에 public decorator를 쓰면
    // 모든 로직을 bypass
		const methodRole = this.reflector.get<UserRole>(RBAC, context.getHandler());
		const classRole = this.reflector.get<UserRole>(RBAC, context.getClass());
		const role = methodRole ?? classRole; // 메서드 우선

    // Role Enum에 해당되는 값이 데코레이터에 들어갔는지 확인하기

    if (!Object.values(UserRole).includes(role)) {
      return true;
    }

    // 요청에서 user 객체가 존재하는지 확인한다.
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    if (!user) {
      return false;
    }
    return user.role <= role;
  }
}