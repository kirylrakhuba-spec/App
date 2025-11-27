import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    
    const token = this.extractTokenFromHeader(request)
    if(!token){
      throw new UnauthorizedException('No authorization token provider')
    }
    try{
      const payload = await this.authService.validateToken(token)
      request['user'] = payload
    }catch(error){
      throw new UnauthorizedException('Token is invalid or expired');
    }
    return true;
  }


  private extractTokenFromHeader(request: Request): string| undefined{
    const[type, token] = request.headers.authorization?.split(' ') ?? []

    return type === 'Bearer' ? token : undefined;
  }
}
