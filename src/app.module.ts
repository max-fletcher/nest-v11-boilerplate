import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { PostsWithUsersModule } from './posts-with-users/posts-with-users.module'
import { AuthModule } from './auth/auth.module'
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    // this binds the throttle/rate-limiter guard globally. You can bind it in many ways though(see docs).
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // Defining throttle/rate-limit logic globally. You can define multiple rate-limits here each with their own set of names and
    // apply them to different routes(see docs).
    ThrottlerModule.forRoot([
      // DEFAULT RATE LIMITERS. YOU CAN SKIP THIS USING USING @SkipThrottle OR OVERRIDE THIS USING THE @Throttle({ default: { ttl: ???, limit: ??? } })
      // decorator over a controller func
      {
        ttl: 60000, // 60000 ms i.e 60 seconds
        limit: 60 // Number of req accepted within this window
      }
    ]),
    UsersModule,
    PostsWithUsersModule,
    AuthModule,
    RolesModule,
    PermissionsModule
  ]
})
export class AppModule {}
