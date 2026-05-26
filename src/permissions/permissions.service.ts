import { Injectable, NotFoundException } from '@nestjs/common'
import { TAssignPermissionToRoleBodyDto } from './validators/assign-permission-to-role.schema'
import { PrismaService } from 'src/prisma/prisma.service'
import { RolesService } from 'src/roles/roles.service'

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService
  ) {}

  async assignPermissionToRole(data: TAssignPermissionToRoleBodyDto) {
    const addActions = [...new Set(data.addActions)]
    const removeActions = [...new Set(data.removeActions)]
    const allActions = [...addActions, ...removeActions]

    const role = await this.prisma.role.findFirst({
      where: { id: data.roleId }
    })
    if (!role) throw new NotFoundException('Role not found')

    const existingPermissions = await this.prisma.permission.findMany({
      where: {
        OR: allActions.map((action) => ({
          action,
          resource: data.resource
        }))
      },
      select: { id: true, action: true, resource: true }
    })

    const addRolePermissions: { roleId: string; permissionId: string }[] = []
    if (addActions && addActions.length > 0) {
      for (let i = 0; i < addActions.length; i++) {
        const findPermission = existingPermissions.find(
          (permission) => permission.action === (addActions[i] as string) && permission.resource === (data.resource as string)
        )
        if (findPermission) addRolePermissions.push({ roleId: data.roleId, permissionId: findPermission.id })
      }
    }

    const removeRolePermissions: { roleId: string; permissionId: string }[] = []
    if (removeActions && removeActions.length > 0) {
      for (let i = 0; i < removeActions.length; i++) {
        const findPermission = existingPermissions.find(
          (permission) => permission.action === (removeActions[i] as string) && permission.resource === (data.resource as string)
        )
        if (findPermission) {
          removeRolePermissions.push({ roleId: role?.id, permissionId: findPermission.id })
        }
      }
    }

    await this.prisma.$transaction(async (tx) => {
      if (addActions && addActions.length > 0) {
        await tx.rolePermission.createMany({ data: addRolePermissions })
      }

      if (removeActions && removeActions.length > 0) {
        await tx.rolePermission.deleteMany({
          where: {
            OR: removeRolePermissions
          }
        })
      }
    })

    return await this.rolesService.get(data.roleId)
  }
}
