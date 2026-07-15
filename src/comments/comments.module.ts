import { Module } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'
import { UsersModule } from 'src/users/users.module'

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [UsersModule]
})
export class CommentsModule {}
