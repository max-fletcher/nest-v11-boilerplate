// terminus has known incomplete type definitions and open type issues
import { Injectable } from '@nestjs/common'
import { HealthIndicatorService, HealthIndicatorResult } from '@nestjs/terminus'
import { RedisService } from 'src/redis/redis.service'

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly redisService: RedisService,
    private readonly healthIndicatorService: HealthIndicatorService
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key)
    try {
      const result = await this.redisService.getClient().ping()
      if (result === 'PONG') return indicator.up()
      return indicator.down({ message: 'Redis ping failed' })
    } catch {
      return indicator.down({ message: 'Redis connection failed' })
    }
  }
}
