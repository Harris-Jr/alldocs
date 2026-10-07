import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { CredentialsDto } from './dto';
import { JwtGuard, type JwtPayload } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  signup(@Body() body: CredentialsDto) {
    return this.auth.signup(body.email, body.password);
  }

  @Post('login')
  login(@Body() body: CredentialsDto) {
    return this.auth.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  me(@Req() req: Request & { user: JwtPayload }) {
    return { id: req.user.sub, email: req.user.email, tier: req.user.tier };
  }
}
