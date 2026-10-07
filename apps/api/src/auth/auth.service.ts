import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RedisService } from '../redis/redis.service';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  tier: 'free' | 'pro' | 'business';
  createdAt: number;
}

export interface AuthResult {
  token: string;
  user: { id: string; email: string; tier: string };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
  ) {}

  private userKey(email: string) {
    return `user:email:${email.toLowerCase()}`;
  }

  async signup(email: string, password: string): Promise<AuthResult> {
    const key = this.userKey(email);
    const exists = await this.redis.client.exists(key);
    if (exists) throw new ConflictException('An account with that email already exists.');

    const user: UserRecord = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      tier: 'free',
      createdAt: Date.now(),
    };
    await this.redis.client.set(key, JSON.stringify(user));
    await this.redis.client.set(`user:id:${user.id}`, key);
    return this.issue(user);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const raw = await this.redis.client.get(this.userKey(email));
    if (!raw) throw new UnauthorizedException('Invalid email or password.');
    const user = JSON.parse(raw) as UserRecord;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password.');
    return this.issue(user);
  }

  private issue(user: UserRecord): AuthResult {
    const token = this.jwt.sign({ sub: user.id, email: user.email, tier: user.tier });
    return { token, user: { id: user.id, email: user.email, tier: user.tier } };
  }
}
