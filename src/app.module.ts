import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { PostsWithUsersModule } from './posts-with-users/posts-with-users.module'
import { AuthModule } from './auth/auth.module'
import { RolesModule } from './roles/roles.module'
import { PermissionsModule } from './permissions/permissions.module'
import { ScheduleModule } from '@nestjs/schedule'
import { CronModule } from './cron/cron.module'
import { RedisModule } from './redis/redis.module'
import { SeederModule } from './seeder/seeder.module'
import { RequestLoggerMiddleware } from './common/middleware/req-logger.middleware'

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
    ScheduleModule.forRoot(),
    UsersModule,
    PostsWithUsersModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    CronModule,
    RedisModule,
    SeederModule
  ]
})

// export class AppModule {}
// This is how you use middleware in Nest.
// You can use above line if you don't want to use middleware(e.g RequestLoggerMiddleware here) at all.
// See additional rules below this block.
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*') // apply to all routes
  }
}
// The ".forRoutes('*')" specifies that the middlware is to be used for all routes/globally. Here are some example options
// to use to apply middleware to specific routes:

// apply to all routes
// .forRoutes('*')

// apply to specific path
// .forRoutes('api/v1/users')

// apply to specific method + path
// .forRoutes({ path: 'api/v1/users', method: RequestMethod.GET })

// apply to specific controller
// .forRoutes(UsersController)

// exclude specific routes
// .apply(RequestLoggerMiddleware)
// .exclude('api/v1/auth/login', 'api/v1/auth/register')
// .forRoutes('*')

// Binds middleware strictly to version 1 routes
// .forRoutes({
//   path: 'cats',
//   version: '1',
//   method: RequestMethod.GET,
// });
