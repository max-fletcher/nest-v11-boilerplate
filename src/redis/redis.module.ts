import { Global, Module } from '@nestjs/common'
import { RedisService } from './redis.service'

@Global() // #IMPORTANT: makes this redis module global
@Module({
  providers: [RedisService],
  exports: [RedisService]
})
export class RedisModule {}
