import { Controller, Get } from '@nestjs/common'
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus'
import { RedisHealthIndicator } from './redis.health'
import { PrismaHealthIndicator } from './prisma.health'

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('database'),
      () => this.redisHealth.isHealthy('redis'),
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com') // for checking if 3rd party APIs are active
    ])
  }
}
