import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken'

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('refresh-token-jwt') {
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false, // the user obj that is passed from the strategy used(in this case, "refresh-token-jwt")
    info: TokenExpiredError | JsonWebTokenError | NotBeforeError | Error | undefined,
    context: ExecutionContext
  ): TUser {
    console.log('RefreshJwtAuthGuard handleRequest:', { error: err?.message, user, info: info?.message })
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('Refresh token has expired. Please log in again.')
    }
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Invalid refresh token. Please log in again.')
    }
    if (!user) {
      throw new UnauthorizedException('Unauthorized. Please log in.')
    }
    return super.handleRequest(err, user, info, context)
  }
}
