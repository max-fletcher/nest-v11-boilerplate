/* eslint-disable */
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { TRBACActions, TRBACResources } from 'src/enums/permissions.enums.js'
import { TRBACRoles } from 'src/enums/roles.enums.js'
import * as bcrypt from 'bcrypt'

async function main() {
  // dynamically imported to avoid the module resolution issue
  const { PrismaClient } = await import('../generated/prisma/client.js')

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not defined in .env')

  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })

  // your seed logic here
  // create permissions
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { action_resource: { action: TRBACActions.CREATE, resource: TRBACResources.POST } },
      update: {},
      create: { action: TRBACActions.CREATE, resource: TRBACResources.POST }
    }),
    prisma.permission.upsert({
      where: { action_resource: { action: TRBACActions.READ, resource: TRBACResources.POST } },
      update: {},
      create: { action: TRBACActions.READ, resource: TRBACResources.POST }
    }),
    prisma.permission.upsert({
      where: { action_resource: { action: TRBACActions.UPDATE, resource: TRBACResources.POST } },
      update: {},
      create: { action: TRBACActions.UPDATE, resource: TRBACResources.POST }
    }),
    prisma.permission.upsert({
      where: { action_resource: { action: TRBACActions.DELETE, resource: TRBACResources.POST } },
      update: {},
      create: { action: TRBACActions.DELETE, resource: TRBACResources.POST }
    }),
    prisma.permission.upsert({
      where: { action_resource: { action: TRBACActions.CREATE, resource: TRBACResources.USER } },
      update: {},
      create: { action: TRBACActions.CREATE, resource: TRBACResources.USER }
    }),
    prisma.permission.upsert({
      where: { action_resource: { action: TRBACActions.READ, resource: TRBACResources.USER } },
      update: {},
      create: { action: TRBACActions.READ, resource: TRBACResources.USER }
    }),
    prisma.permission.upsert({
      where: { action_resource: { action: TRBACActions.UPDATE, resource: TRBACResources.USER } },
      update: {},
      create: { action: TRBACActions.UPDATE, resource: TRBACResources.USER }
    }),
    prisma.permission.upsert({
      where: { action_resource: { action: TRBACActions.DELETE, resource: TRBACResources.USER } },
      update: {},
      create: { action: TRBACActions.DELETE, resource: TRBACResources.USER }
    })
  ])

  // create roles
  const adminRole = await prisma.role.upsert({
    where: { name: TRBACRoles.ADMIN },
    update: {},
    create: { name: TRBACRoles.ADMIN }
  })

  const moderatorRole = await prisma.role.upsert({
    where: { name: TRBACRoles.MODERATOR },
    update: {},
    create: { name: TRBACRoles.MODERATOR }
  })

  const userRole = await prisma.role.upsert({
    where: { name: TRBACRoles.USER },
    update: {},
    create: { name: TRBACRoles.USER }
  })

  // assign all permissions to admin
  await Promise.all(
    permissions.map((permission) =>
      prisma.rolePermission.upsert({
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
      prisma.rolePermission.upsert({
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
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: userRole.id, permissionId: permission.id } },
        update: {},
        create: { roleId: userRole.id, permissionId: permission.id }
      })
    )
  )

  // create admin user
  const hashedPassword = await bcrypt.hash('password', 10)
  const createdUser = await prisma.user.upsert({
    where: { email: 'admin@mail.com' },
    update: {},
    create: { email: 'admin@mail.com', name: 'admin', password: hashedPassword }
  })
  await prisma.userRole.create({ data: { userId: createdUser.id, roleId: adminRole.id } })

  console.log('Seeded roles and permissions successfully')

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})
