/* eslint-disable */
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'

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
    prisma.permission.upsert({ where: { action_resource: { action: 'create', resource: 'post' } }, update: {}, create: { action: 'create', resource: 'post' } }),
    prisma.permission.upsert({ where: { action_resource: { action: 'read', resource: 'post' } }, update: {}, create: { action: 'read', resource: 'post' } }),
    prisma.permission.upsert({ where: { action_resource: { action: 'update', resource: 'post' } }, update: {}, create: { action: 'update', resource: 'post' } }),
    prisma.permission.upsert({ where: { action_resource: { action: 'delete', resource: 'post' } }, update: {}, create: { action: 'delete', resource: 'post' } }),
    prisma.permission.upsert({ where: { action_resource: { action: 'create', resource: 'user' } }, update: {}, create: { action: 'create', resource: 'user' } }),
    prisma.permission.upsert({ where: { action_resource: { action: 'read', resource: 'user' } }, update: {}, create: { action: 'read', resource: 'user' } }),
    prisma.permission.upsert({ where: { action_resource: { action: 'update', resource: 'user' } }, update: {}, create: { action: 'update', resource: 'user' } }),
    prisma.permission.upsert({ where: { action_resource: { action: 'delete', resource: 'user' } }, update: {}, create: { action: 'delete', resource: 'user' } })
  ])

  // create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' }
  })

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: { name: 'moderator' }
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user' }
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

  console.log('Seeded roles and permissions successfully')

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})
