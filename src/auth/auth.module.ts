import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AccessTokenStrategy } from './strategies/access-token.strategy'
import { ConfigModule } from '@nestjs/config'
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy'

// To use auth using passport js, you need 3 things:
// 1. A Strategy 2. A Guard 3. Correct export and imports
// Step 1: Make a strategy with a type(we used 'jwt' here)
// Step 2: Make a guard with matching type(we used 'jwt' here)
// Step 3: Import, export and add to providers the following: PassportModule, JwtModule.register, PassportModule and AccessTokenStrategy in the auth module
// The Strategy contains (custom)logic for verifying the JWT(not adding it to providers and exports causes missing logic). The guard is the guard
// that intercepts the request and uses the strategy(with same name) to verify the token.
// Step 4: Define logic in the auth module(controller and service services) on how the the JWT will be constructed and delivered. Should Make
// sense in tandem with logic defined in the strategy(see this.jwtService.signAsync inside auth services).
// Step 5: Import auth module inside module that needs to be protected(here, we use it on user module).
// Step 6: Import the guard you want to use("AccessTokenAuthGuard" in this case) and apply Guards using "@UseGuards" on routes or entire controllers
// (see @UseGuards(AccessTokenAuthGuard))

@Module({
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
  imports: [ConfigModule, PassportModule, JwtModule.register({})],
  exports: [PassportModule, AccessTokenStrategy, RefreshTokenStrategy]
})
export class AuthModule {}
