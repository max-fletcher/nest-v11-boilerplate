import { Module } from '@nestjs/common'
import { CronService } from './cron.service'
import { UsersModule } from 'src/users/users.module'

@Module({
  providers: [CronService],
  imports: [UsersModule]
})
export class CronModule {}
