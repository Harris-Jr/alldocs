import { Controller, Get } from '@nestjs/common';
import { RedisService } from './redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(private readonly redis: RedisService) {}

  @Get()
  async health() {
    let redis = 'down';
    try {
      redis = (await this.redis.client.ping()) === 'PONG' ? 'up' : 'down';
    } catch {
      redis = 'down';
    }
    return { status: 'ok', redis, time: new Date().toISOString() };
  }
}
