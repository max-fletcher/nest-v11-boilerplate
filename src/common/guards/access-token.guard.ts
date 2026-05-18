import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class AccessTokenAuthGuard extends AuthGuard('access-token-jwt') {
  // You probably don't need this as it is invoked by default.
  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }

  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false, // the user obj that is passed from the strategy used(in this case, "access-token-jwt")
    info: JsonWebTokenError | TokenExpiredError | Error | undefined,
    context: ExecutionContext
  ): TUser {
    console.log('AccessTokenAuthGuard handleRequest:', { error: err?.message, user, info: info?.message })

    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('Your session has expired. Please log in again.')
    }

    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Invalid token. Please log in again.')
    }

    if (info instanceof NotBeforeError) {
      throw new UnauthorizedException('Token not yet valid. Please log in again.')
    }

    if (err) {
      throw new UnauthorizedException(err.message)
    }

    if (!user) {
      throw new UnauthorizedException('Unauthorized. Please log in.')
    }

    return super.handleRequest(err, user, info, context)
  }
}
