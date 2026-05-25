import { Module } from '@nestjs/common'
import { RolesController } from './roles.controller'
import { RolesService } from './roles.service'
import { UsersModule } from 'src/users/users.module'

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [UsersModule]
})
export class RolesModule {}
