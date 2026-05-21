import { SetMetadata } from '@nestjs/common'
import { TRBACRolesList } from 'src/enums/roles.enums'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: (typeof TRBACRolesList)[number][]) => SetMetadata(ROLES_KEY, roles)
