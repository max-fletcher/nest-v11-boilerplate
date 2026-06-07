import { Injectable } from '@nestjs/common'
// import { TRBACActions, TRBACResources } from '../src/enums/permissions.enums'
// import { TRBACRoles } from '../src/enums/roles.enums'
import * as bcrypt from 'bcrypt'
import { Permission } from 'generated/prisma/client'
import { TRBACActions, TRBACResources } from 'src/enums/permissions.enums'
import { TRBACRoles } from 'src/enums/roles.enums'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class SeederService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    // your seed logic here
    // create permissions
    const permissions: Permission[] = await Promise.all([
      this.prisma.permission.upsert({
        where: { action_resource: { action: TRBACActions.CREATE, resource: TRBACResources.POST } },
        update: {},
        create: { action: TRBACActions.CREATE, resource: TRBACResources.POST }
      }),
      this.prisma.permission.upsert({
        where: { action_resource: { action: TRBACActions.READ, resource: TRBACResources.POST } },
        update: {},
        create: { action: TRBACActions.READ, resource: TRBACResources.POST }
      }),
      this.prisma.permission.upsert({
        where: { action_resource: { action: TRBACActions.UPDATE, resource: TRBACResources.POST } },
        update: {},
        create: { action: TRBACActions.UPDATE, resource: TRBACResources.POST }
      }),
      this.prisma.permission.upsert({
        where: { action_resource: { action: TRBACActions.DELETE, resource: TRBACResources.POST } },
        update: {},
        create: { action: TRBACActions.DELETE, resource: TRBACResources.POST }
      }),
      this.prisma.permission.upsert({
        where: { action_resource: { action: TRBACActions.CREATE, resource: TRBACResources.USER } },
        update: {},
        create: { action: TRBACActions.CREATE, resource: TRBACResources.USER }
      }),
      this.prisma.permission.upsert({
        where: { action_resource: { action: TRBACActions.READ, resource: TRBACResources.USER } },
        update: {},
        create: { action: TRBACActions.READ, resource: TRBACResources.USER }
      }),
      this.prisma.permission.upsert({
        where: { action_resource: { action: TRBACActions.UPDATE, resource: TRBACResources.USER } },
        update: {},
        create: { action: TRBACActions.UPDATE, resource: TRBACResources.USER }
      }),
      this.prisma.permission.upsert({
        where: { action_resource: { action: TRBACActions.DELETE, resource: TRBACResources.USER } },
        update: {},
        create: { action: TRBACActions.DELETE, resource: TRBACResources.USER }
      }),
      this.prisma.permission.upsert({
        where: { action_resource: { action: TRBACActions.READ, resource: TRBACResources.ROLES } },
        update: {},
        create: { action: TRBACActions.READ, resource: TRBACResources.ROLES }
      }),
      this.prisma.permission.upsert({
        where: { action_resource: { action: TRBACActions.UPDATE, resource: TRBACResources.ROLES } },
        update: {},
        create: { action: TRBACActions.UPDATE, resource: TRBACResources.ROLES }
      }),
      this.prisma.permission.upsert({
        where: { action_resource: { action: TRBACActions.READ, resource: TRBACResources.PERMISSIONS } },
        update: {},
        create: { action: TRBACActions.READ, resource: TRBACResources.PERMISSIONS }
      }),
      this.prisma.permission.upsert({
        where: { action_resource: { action: TRBACActions.UPDATE, resource: TRBACResources.PERMISSIONS } },
        update: {},
        create: { action: TRBACActions.UPDATE, resource: TRBACResources.PERMISSIONS }
      })
    ])

    // create roles
    const adminRole = await this.prisma.role.upsert({
      where: { name: TRBACRoles.ADMIN },
      update: {},
      create: { name: TRBACRoles.ADMIN }
    })

    const moderatorRole = await this.prisma.role.upsert({
      where: { name: TRBACRoles.MODERATOR },
      update: {},
      create: { name: TRBACRoles.MODERATOR }
    })

    const userRole = await this.prisma.role.upsert({
      where: { name: TRBACRoles.USER },
      update: {},
      create: { name: TRBACRoles.USER }
    })

    // assign all permissions to admin
    await Promise.all(
      permissions.map((permission) =>
        this.prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
          update: {},
          create: { roleId: adminRole.id, permissionId: permission.id }
        })
      )
    )

    // assign limited permissions to moderator
    const moderatorPermissions = permissions.filter((p) => ['read:post', 'update:post', 'delete:post', 'read:user'].includes(`${p.action}:${p.resource}`))
    await Promise.all(
      moderatorPermissions.map((permission) =>
        this.prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: moderatorRole.id, permissionId: permission.id } },
          update: {},
          create: { roleId: moderatorRole.id, permissionId: permission.id }
        })
      )
    )

    // assign basic permissions to user
    const basicPermissions = permissions.filter((p) => ['read:post', 'create:post', 'read:user'].includes(`${p.action}:${p.resource}`))
    await Promise.all(
      basicPermissions.map((permission) =>
        this.prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: userRole.id, permissionId: permission.id } },
          update: {},
          create: { roleId: userRole.id, permissionId: permission.id }
        })
      )
    )

    // create admin user
    const hashedPassword = await bcrypt.hash('password', 10)
    const createdUser = await this.prisma.user.upsert({
      where: { email: 'admin@mail.com' },
      update: {},
      create: { email: 'admin@mail.com', name: 'admin', password: hashedPassword }
    })
    await this.prisma.userRole.create({ data: { userId: createdUser.id, roleId: adminRole.id } })

    console.log('Seeded roles, permissions and admin user successfully')

    return `Seeded roles, permissions and admin user successfully`
  }
}
