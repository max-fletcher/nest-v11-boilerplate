import { RoleWithPermissionsSchema, UserWithRolesSchema } from 'src/users/swagger/users.swagger'

export const AssignRolesToUserBody = {
  schema: {
    type: 'object',
    required: ['userId'],
    properties: {
      userId: {
        type: 'string',
        example: 'cmpwgpxzy0002cc....'
      },
      assignRoles: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Role IDs to assign. Either assignRoles or removeRoles must contain at least one item.',
        example: ['cmpwgpxzy0002cc....', 'w489efh98w3h093....']
      },
      removeRoles: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Role IDs to remove. Either assignRoles or removeRoles must contain at least one item.',
        example: ['cmpwgpxzy0032f....', 'dfuivbsfg8sfd33....']
      }
    }
  }
}

export const RolesAssignedAndRemovedFromUserResponse = {
  description: 'When roles are assigned and/or removed from a user successfully',
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
              userWithRole: UserWithRolesSchema
            }
          }
        }
      }
    }
  }
}

export const RoleWithPermissionResponse = {
  description: 'When a role with its associated permissions successfully',
  schema: RoleWithPermissionsSchema
}
