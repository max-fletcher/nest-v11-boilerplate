import { ExecutionContext, Injectable } from '@nestjs/common'
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // You probably don't need this as it is invoked by default.
  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }

  // #TODO: kept it here for debugging purposes. Remove later.
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false,
    info: JsonWebTokenError | TokenExpiredError | Error | undefined,
    context: ExecutionContext
  ): TUser {
    console.log('JwtAuthGuard handleRequest:', { error: err?.message, user, info: info?.message })
    return super.handleRequest(err, user, info, context)
  }
}
