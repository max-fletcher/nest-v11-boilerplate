import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { AuthService } from '../auth.service'
import { JwtPayload } from 'src/types/tokens.types'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-token-jwt') {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true // gives us access to req in validate()
    })
  }

  async validate(req: Request, payload: JwtPayload) {
    // extract raw refresh token from header
    const authHeader = req.get('Authorization')
    // console.log('refresh-token strategy authHeader', authHeader)
    if (!authHeader) throw new UnauthorizedException('No refresh token provided.')

    const refreshToken = authHeader.replace('Bearer', '').trim()

    // validate it against the hashed version in DB
    const user = await this.authService.validateRefreshToken(payload.sub, refreshToken)
    if (!user) throw new UnauthorizedException('Invalid refresh token.')

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      background: user.background
    }
  }
}
