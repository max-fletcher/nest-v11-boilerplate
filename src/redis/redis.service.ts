import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService {
  private readonly redis: Redis

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: configService.get<string>('REDIS_HOST') ?? 'localhost',
      port: configService.get<number>('REDIS_PORT') ?? 6379
    })
  }

  getClient() {
    return this.redis
  }

  async setValue(key: string, data: unknown, expiry: null | number = null) {
    let valueSet
    if (expiry) valueSet = await this.getClient().set(key, JSON.stringify(data), 'EX', expiry)
    else valueSet = await this.getClient().set(key, JSON.stringify(data))

    // console.log('Redis valueSet', valueSet)
    if (valueSet) return true

    return false
  }

  async getValue(key: string) {
    const valueGet = await this.getClient().get(key)

    // console.log('Redis valueGet', valueGet)
    if (valueGet) return JSON.parse(valueGet) as unknown

    return false
  }

  async deleteValue(key: string) {
    return await this.getClient().del(key)
  }

  // invalidate all keys matching a prefix pattern
  async invalidateByPrefix(prefix: string) {
    const pattern = `${prefix}*`
    let cursor = '0'
    const keysToDelete: string[] = []

    // SCAN is non-blocking unlike KEYS — safe for production
    do {
      const [nextCursor, keys] = await this.getClient().scan(cursor, 'MATCH', pattern, 'COUNT', 100)
      cursor = nextCursor
      keysToDelete.push(...keys)
    } while (cursor !== '0')

    if (keysToDelete.length > 0) {
      await this.getClient().del(...keysToDelete)
      // console.log(`Invalidated ${keysToDelete.length} keys with prefix: ${prefix}`)
    }
  }

  // cleanup on app shutdown
  async onModuleDestroy() {
    await this.redis.quit()
  }
}
