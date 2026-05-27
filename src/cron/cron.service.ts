import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class CronService {
  constructor(private readonly usersService: UsersService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  cleanupExpiredPosts() {
    this.usersService.dummy()
  }
}
