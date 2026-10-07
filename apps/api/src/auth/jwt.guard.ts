import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

export const OPTIONAL_AUTH = 'optionalAuth';
/** Mark a route as allowing anonymous access (free tier, no signup). */
export const OptionalAuth = () => SetMetadata(OPTIONAL_AUTH, true);

export interface JwtPayload {
  sub: string;
  email: string;
  tier: string;
}

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const optional = this.reflector.getAllAndOverride<boolean>(OPTIONAL_AUTH, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      if (optional) return true; // anonymous allowed
      throw new UnauthorizedException('Authentication required.');
    }

    try {
      req.user = this.jwt.verify<JwtPayload>(token);
      return true;
    } catch {
      if (optional) return true; // bad token but route is public → treat as anon
      throw new UnauthorizedException('Invalid or expired session.');
    }
  }
}
