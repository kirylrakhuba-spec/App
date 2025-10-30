import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Получаем список ролей, разрешённых на этом маршруте
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      // если роли не указаны — доступ открыт всем
      return true;
    }

    // Извлекаем пользователя из запроса
    const { user } = context.switchToHttp().getRequest();

    // Проверяем, есть ли у пользователя нужная роль
    return requiredRoles.includes(user.role);
  }
}