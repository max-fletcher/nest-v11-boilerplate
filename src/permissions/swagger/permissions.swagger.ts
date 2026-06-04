import { TRBACActions, TRBACResources } from 'src/enums/permissions.enums'
import { RoleWithPermissionsSchema } from 'src/roles/swagger/roles.swagger'

export const AssignPermissionsToRoleBody = {
  schema: {
    type: 'object',
    required: ['roleId'],
    properties: {
      roleId: {
        type: 'string',
        example: 'cmpwgpxzy0002cc....'
      },
      resource: {
        type: 'string',
        enum: Object.values(TRBACResources),
        example: TRBACResources.POST
      },
      addActions: {
        type: 'string',
        enum: Object.values(TRBACActions),
        description: 'Actions to assign. Either addActions or removeActions must contain at least one item.',
        example: [TRBACActions.UPDATE, TRBACActions.DELETE]
      },
      removeRoles: {
        type: 'string',
        enum: Object.values(TRBACActions),
        description: 'Actions to assign. Either addActions or removeActions must contain at least one item.',
        example: [TRBACActions.READ]
      }
    }
  }
}

export const AssignPermissionsToRoleResponse = {
  description: 'When a role with its associated permissions successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      status: { type: 'number', example: 200 },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'object',
            properties: {
              roleWithPermissions: RoleWithPermissionsSchema
            }
          }
        }
      }
    }
  }
}
