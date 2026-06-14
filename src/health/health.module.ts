import { Module } from '@nestjs/common'
import { HealthIndicatorService, TerminusModule } from '@nestjs/terminus'
import { PrismaModule } from 'src/prisma/prisma.module'
import { HealthController } from './health.controller'
import { RedisModule } from 'src/redis/redis.module'
import { RedisHealthIndicator } from './redis.health'
import { HttpModule } from '@nestjs/axios'
import { PrismaHealthIndicator } from './prisma.health'

@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty' // pretty error logs in console
    }),
    HttpModule,
    PrismaModule,
    RedisModule
  ],
  controllers: [HealthController],
  providers: [HealthIndicatorService, PrismaHealthIndicator, RedisHealthIndicator]
})
export class HealthModule {}
