// import { TRBACRolesList } from 'src/enums/roles.enums'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

// in case you want to pass the name of the role
// export const AssignRolesToUserBaseSchema = z.object({
//   userid: z.string({
//     error: (issue) => (issue.input === undefined ? 'User id is required.' : 'User id must be a string.')
//   }),
//   assignRoles: z
//     .array(
//       z.enum(TRBACRolesList, {
//         error: (issue) => {
//           switch (issue.code) {
//             case 'invalid_type' as string:
//               return { message: 'Assign roles is required.' }
//             case 'invalid_enum_value' as string:
//               return { message: 'Invalid value for assign roles.' }
//             default:
//               return { message: 'Invalid value for assign roles.' }
//           }
//         }
//       })
//     )
//     .optional(),
//   removeRoles: z
//     .array(
//       z.enum(TRBACRolesList, {
//         error: (issue) => {
//           switch (issue.code) {
//             case 'invalid_type' as string:
//               return { message: 'Remove roles is required.' }
//             case 'invalid_enum_value' as string:
//               return { message: 'Invalid value for remove roles.' }
//             default:
//               return { message: 'Invalid value for remove roles.' }
//           }
//         }
//       })
//     )
//     .optional()
// })

// export const AssignRolesToUserSchema = (prisma: PrismaService) =>
//   AssignRolesToUserBaseSchema.superRefine(async (data, ctx) => {
//     const userExists = await prisma.user.count({
//       where: {
//         id: data.userid
//       }
//     })
//     if (!userExists) {
//       ctx.addIssue({
//         code: 'custom',
//         message: `User with this ID not found.`,
//         path: ['userId']
//       })
//     }

//     if (data.assignRoles) {
//       const assignRoleNames = [...new Set(data.assignRoles)]
//       const assignRolesCount = await prisma.role.count({
//         where: {
//           name: {
//             in: assignRoleNames
//           }
//         }
//       })

//       if (assignRolesCount !== data.assignRoles.length) {
//         ctx.addIssue({
//           code: 'custom',
//           message: `Some role names are invalid.`,
//           path: ['assignRoles']
//         })
//       }
//     }

//     if (data.removeRoles) {
//       const removeRoleName = [...new Set(data.removeRoles)]
//       const assignRolesCount = await prisma.role.count({
//         where: {
//           name: {
//             in: removeRoleName
//           }
//         }
//       })

//       if (assignRolesCount !== data.removeRoles.length) {
//         ctx.addIssue({
//           code: 'custom',
//           message: `Some role names are invalid.`,
//           path: ['removeRoles']
//         })
//       }
//     }
//   })

export const AssignRolesToUserBaseSchema = z.object({
  userId: z.string({
    error: (issue) => (issue.input === undefined ? 'User id is required.' : 'User id must be a string.')
  }),
  assignRoles: z.array(z.string()).optional(),
  removeRoles: z.array(z.string()).optional()
})

export const AssignRolesToUserSchema = (prisma: PrismaService) =>
  AssignRolesToUserBaseSchema.superRefine(async (data, ctx) => {
    if (!data.assignRoles?.length && !data.removeRoles?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one role must be provided for assignment or removal.',
        path: ['assignRoles']
      })
      ctx.addIssue({
        code: 'custom',
        message: 'At least one role must be provided for assignment or removal.',
        path: ['removeRoles']
      })
      return // skip rest of the validation to save server resources
    }

    // check overlap i.e both assign and remove has same role
    if (data.assignRoles && data.removeRoles) {
      const overlap = data.assignRoles.filter((role) => data.removeRoles!.includes(role))
      if (overlap.length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Same role cannot be in both assign and remove.',
          path: ['assignRoles']
        })
        ctx.addIssue({
          code: 'custom',
          message: 'Same role cannot be in both assign and remove.',
          path: ['removeRoles']
        })
        return // skip rest of the validation to save server resources
      }
    }

    // NOTE: without optimization but less complex
    // const userExists = await prisma.user.count({
    //   where: {
    //     id: data.userId
    //   }
    // })
    // if (!userExists) {
    //   ctx.addIssue({
    //     code: 'custom',
    //     message: `User with this ID not found.`,
    //     path: ['userId']
    //   })
    // }

    // if (data.assignRoles) {
    //   const assignRoleIds = [...new Set(data.assignRoles)]
    //   const assignRolesCount = await prisma.role.count({
    //     where: {
    //       id: {
    //         in: assignRoleIds
    //       }
    //     }
    //   })
    //   if (assignRolesCount !== data.assignRoles.length) {
    //     ctx.addIssue({
    //       code: 'custom',
    //       message: `Some role ids are invalid.`,
    //       path: ['assignRoles']
    //     })
    //   }
    // }

    // if (data.removeRoles) {
    //   const removeRoleIds = [...new Set(data.removeRoles)]
    //   const assignRolesCount = await prisma.role.count({
    //     where: {
    //       id: {
    //         in: removeRoleIds
    //       }
    //     }
    //   })
    //   if (assignRolesCount !== data.removeRoles.length) {
    //     ctx.addIssue({
    //       code: 'custom',
    //       message: `Some role ids are invalid.`,
    //       path: ['removeRoles']
    //     })
    //   }
    // }

    // NOTE: with optimization but more complex
    const userExistsPromise = prisma.user.count({
      where: {
        id: data.userId
      }
    })

    let assignedRoleCountPromise: Promise<number> | undefined = undefined
    let assignRoleIds: string[] = []
    if (data.assignRoles && data.assignRoles.length > 0) {
      assignRoleIds = [...new Set(data.assignRoles)]
      assignedRoleCountPromise = prisma.role.count({
        where: {
          id: {
            in: assignRoleIds
          }
        }
      })
    }

    let removeRoleCountPromise: Promise<number> | undefined = undefined
    let removeRoleIds: string[] = []
    if (data.removeRoles && data.removeRoles.length > 0) {
      removeRoleIds = [...new Set(data.removeRoles)]
      removeRoleCountPromise = prisma.role.count({
        where: {
          id: {
            in: removeRoleIds
          }
        }
      })
    }

    const [userExists, assignRolesCount, removeRolesCount] = await Promise.all([userExistsPromise, assignedRoleCountPromise, removeRoleCountPromise])

    if (!userExists) {
      ctx.addIssue({
        code: 'custom',
        message: `User with this ID not found.`,
        path: ['userId']
      })
    }

    if (assignRoleIds.length > 0 && assignRolesCount !== assignRoleIds.length) {
      ctx.addIssue({
        code: 'custom',
        message: `Some assign role ids are invalid.`,
        path: ['assignRoles']
      })
    }

    if (removeRoleIds.length > 0 && removeRolesCount !== removeRoleIds.length) {
      ctx.addIssue({
        code: 'custom',
        message: `Some remove role ids are invalid.`,
        path: ['removeRoles']
      })
    }
  })

export type AssignRolesToUserSchemaZodValDto = z.infer<ReturnType<typeof AssignRolesToUserSchema>>
export type TAssignRolesToUserBodyDto = AssignRolesToUserSchemaZodValDto
