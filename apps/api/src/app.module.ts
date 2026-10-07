import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { JobsModule } from './jobs/jobs.module';
import { HealthController } from './health.controller';

@Module({
  imports: [RedisModule, StorageModule, AuthModule, UploadsModule, JobsModule],
  controllers: [HealthController],
})
export class AppModule {}
