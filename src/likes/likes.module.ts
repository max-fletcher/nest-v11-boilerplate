import { Module } from '@nestjs/common'
import { LikesService } from './likes.service'
import { LikesController } from './likes.controller'
import { Posts2Module } from 'src/posts2/posts2.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  controllers: [LikesController],
  providers: [LikesService],
  imports: [Posts2Module, UsersModule]
})
export class LikesModule {}
