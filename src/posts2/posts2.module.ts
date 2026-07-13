import { Module } from '@nestjs/common'
import { Posts2Service } from './posts2.service'
import { Posts2Controller } from './posts2.controller'
import { UsersModule } from 'src/users/users.module'

@Module({
  providers: [Posts2Service],
  controllers: [Posts2Controller],
  imports: [UsersModule]
})
export class Posts2Module {}
