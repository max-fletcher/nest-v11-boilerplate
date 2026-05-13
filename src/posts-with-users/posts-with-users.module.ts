import { Module } from '@nestjs/common';
import { PostsWithUsersService } from './posts-with-users.service';
import { PostsWithUsersController } from './posts-with-users.controller';

@Module({
  providers: [PostsWithUsersService],
  controllers: [PostsWithUsersController]
})
export class PostsWithUsersModule {}
