import { Module } from '@nestjs/common'
import { PostsWithUsersService } from './posts-with-users.service'
import { PostsWithUsersController } from './posts-with-users.controller'
import { UsersModule } from 'src/users/users.module'

@Module({
  providers: [PostsWithUsersService],
  controllers: [PostsWithUsersController],
  imports: [UsersModule]
})
export class PostsWithUsersModule {}
