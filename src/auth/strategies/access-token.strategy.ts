import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from '../auth.service'
import { JwtPayload } from 'src/types/tokens.types'

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'access-token-jwt') {
  // extending a strategy so we can add functionality to it
  // super is used to pass what is needed to the parent class's properties for it to function as expected
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // this defines that we will extract the token from auth header as bearer token
      ignoreExpiration: false, // if set to true, will ignore the expiration datetime of the JWT
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET') // This will be used to decrypt the JWT. Should have the same value as 'secret'
    })
  }

  // custom validate function that will either return a user or an exception(usually should resolves to a boolean)
  // By the time this function is called, the above constructor's super method will have already extracted the JWT and decoded it using secretOrKey
  // It is here you can check if this JWT matches any database records i.e username and email, else throw an error
  // At this point the token signature is already verified. validate() is your chance to:
  // Check the user still exists in the database
  // Check the user isn't banned/deleted
  // Attach the full user object to the request
  async validate(payload: JwtPayload) {
    // console.log('access-token strategy payload', payload)
    const user = await this.authService.validateAccessTokenUser(payload.sub)
    if (!user) throw new UnauthorizedException('Invalid JWT Token provided.')

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      background: user.background
    }
  }
}
