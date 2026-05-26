import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from 'generated/prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { handlePrismaError } from 'src/utils/prisma/prisma.utils'
import { TAssignRolesToUserBodyDto } from './validators/assign-roles-to-user.schema'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService
  ) {}

  async assignRolesToUser(data: TAssignRolesToUserBodyDto) {
    try {
      await this.prisma.$transaction(async (tx) => {
        if (data.assignRoles && data.assignRoles.length > 0) {
          await Promise.all(
            data.assignRoles.map((roleId) =>
              tx.userRole.upsert({
                where: { userId_roleId: { roleId: roleId, userId: data.userId } },
                update: {},
                create: { roleId: roleId, userId: data.userId }
              })
            )
          )
        }

        if (data.removeRoles && data.removeRoles.length > 0) {
          await tx.userRole.deleteMany({
            where: { userId: data.userId, roleId: { in: data.removeRoles } }
          })
        }
      })

      return await this.usersService.findOneWithRoles(data.userId)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error)
      }
      throw error
    }
  }

  async get(roleId: string) {
    try {
      const roleWithPermissions = await this.prisma.role.findFirst({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          }
        }
      })

      if (!roleWithPermissions) throw new NotFoundException('Role not found.')

      return roleWithPermissions
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error)
      }
      throw error
    }
  }
}
