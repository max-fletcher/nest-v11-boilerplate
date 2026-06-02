import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { ROLES_KEY } from '../decorators/RBAC/roles.decorator'
import { PERMISSIONS_KEY } from '../decorators/RBAC/permissions.decorator'
import { User } from 'generated/prisma/client'
import { UsersService } from 'src/users/users.service'
import { TRBACPermission } from 'src/enums/permissions.enums'

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // get required roles and permissions from decorators
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()])
    const requiredPermissions = this.reflector.getAllAndOverride<TRBACPermission[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()])

    // if no roles or permissions required, allow access
    if (!requiredRoles && !requiredPermissions) return true

    // get logged in user from request
    const request = context.switchToHttp().getRequest<Request>()
    const user = request.user as User
    // console.log('request.user from RBAC GUARD', request.user)
    if (!user) throw new UnauthorizedException('Please log in first.') // handle gracefully

    // fetch user's roles and permissions from DB
    const userWithRoles = await this.usersService.findOneWithRoles(user.id)
    if (!userWithRoles) throw new ForbiddenException('Access denied.')

    // extract role names
    // Had to use ts assertion like this because of some eslint rule or something. Nest can suck my dick !!
    const userRoleNames = (
      userWithRoles.userRoles as Array<{ role: { name: string; rolePermissions: Array<{ permission: { action: string; resource: string } }> } }>
    ).map((ur) => ur.role.name)

    // extract permissions as "action:resource" strings
    // Had to use ts assertion like this because of some eslint rule or something. Nest can suck my dick !!
    const userPermissions = (
      userWithRoles.userRoles as Array<{ role: { name: string; rolePermissions: Array<{ permission: { action: string; resource: string } }> } }>
    ).flatMap((ur) => ur.role.rolePermissions.map((rp) => `${rp.permission.action}:${rp.permission.resource}`))

    // check roles
    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) => userRoleNames.includes(role))
      // console.log('roles check', requiredRoles, userRoleNames, hasRole)
      if (!hasRole) throw new ForbiddenException('Insufficient role.')
    }

    // check permissions
    if (requiredPermissions) {
      const hasPermission = requiredPermissions.every((required) => userPermissions.includes(`${required.action}:${required.resource}`))
      // console.log('permissions check', requiredPermissions, userPermissions, hasPermission)
      if (!hasPermission) throw new ForbiddenException('Insufficient permissions.')
    }

    return true
  }
}
