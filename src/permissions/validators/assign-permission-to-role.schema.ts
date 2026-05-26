import { TRBACActions, TRBACResources } from 'src/enums/permissions.enums'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

export const AssignPermissionToRoleBaseSchema = z.object({
  roleId: z.string({
    error: (issue) => (issue.input === undefined ? 'Role id is required.' : 'Role id must be a string.')
  }),
  resource: z.enum(TRBACResources, {
    error: (issue) => {
      switch (issue.code) {
        case 'invalid_type' as string:
          return { message: 'Resources is required.' }
        case 'invalid_enum_value' as string:
          return { message: 'Invalid value for resources.' }
        default:
          return { message: 'Invalid value for resources.' }
      }
    }
  }),
  addActions: z
    .array(
      z.enum(TRBACActions, {
        error: (issue) => {
          switch (issue.code) {
            case 'invalid_type' as string:
              return { message: 'Add actions is required.' }
            case 'invalid_enum_value' as string:
              return { message: 'Invalid value for add actions.' }
            default:
              return { message: 'Invalid value for add actions.' }
          }
        }
      })
    )
    .optional(),
  removeActions: z
    .array(
      z.enum(TRBACActions, {
        error: (issue) => {
          switch (issue.code) {
            case 'invalid_type' as string:
              return { message: 'Remove actions is required.' }
            case 'invalid_enum_value' as string:
              return { message: 'Invalid value for remove actions.' }
            default:
              return { message: 'Invalid value for remove actions.' }
          }
        }
      })
    )
    .optional()
})

export const AssignPermissionToRoleSchema = (prisma: PrismaService) =>
  AssignPermissionToRoleBaseSchema.superRefine(async (data, ctx) => {
    const roleExists = await prisma.role.count({
      where: {
        id: data.roleId
      }
    })

    if (!roleExists) {
      ctx.addIssue({
        code: 'custom',
        message: `Role with this id doesn't exist.`,
        path: ['roleId']
      })
    }

    if (!data.addActions?.length && !data.removeActions?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one of add actions or remove actions must be provided.',
        path: ['addActions']
      })
      return // skip rest of the validation to save server resources
    }

    // check overlap i.e both add and remove has say "create"
    if (data.addActions && data.removeActions) {
      const overlap = data.addActions.filter((action) => data.removeActions!.includes(action))
      if (overlap.length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Same action cannot be in both add actions and remove actions.',
          path: ['removeActions']
        })
        return // skip rest of the validation to save server resources
      }
    }

    // find permissions matching action+resource combination
    let rolePermissionExistsForAddPromise: Promise<number> | undefined = undefined
    const addActions = [...new Set(data.addActions)]
    if (addActions.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: {
          OR: addActions.map((action) => ({
            action,
            resource: data.resource
          }))
        },
        select: { id: true }
      })

      if (permissions.length !== 0) {
        // check if any of those permissions are already assigned to the role(stored in a promise var here)
        rolePermissionExistsForAddPromise = prisma.rolePermission.count({
          where: {
            roleId: data.roleId,
            permissionId: { in: permissions.map((p) => p.id) }
          }
        })
      }
    }

    let rolePermissionExistsForRemovePromise: Promise<number> | undefined = undefined
    const removeActions = [...new Set(data.removeActions)]
    if (removeActions.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: {
          OR: removeActions.map((action) => ({
            action,
            resource: data.resource
          }))
        },
        select: { id: true }
      })

      if (permissions.length !== 0) {
        // check if any permissions exists(stored in a promise var here)
        rolePermissionExistsForRemovePromise = prisma.rolePermission.count({
          where: {
            roleId: data.roleId,
            permissionId: { in: permissions.map((p) => p.id) }
          }
        })
      }
    }

    const [rolePermissionForAddExists, rolePermissionForRemoveExists] = await Promise.all([rolePermissionExistsForAddPromise, rolePermissionExistsForRemovePromise])

    if (rolePermissionForAddExists && rolePermissionForAddExists > 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'One or more permissions already exist for this role.',
        path: ['addActions']
      })
    }

    // check if count is 0 OR promise was never set(permissions don't exist i.e rolePermissionForRemoveExists is undefined)
    if (!rolePermissionForRemoveExists || rolePermissionForRemoveExists === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Permissions not found for this role.',
        path: ['removeActions']
      })
    }
  })

export type TAssignPermissionToRoleZodValDto = z.infer<ReturnType<typeof AssignPermissionToRoleSchema>>
export type TAssignPermissionToRoleBodyDto = TAssignPermissionToRoleZodValDto
