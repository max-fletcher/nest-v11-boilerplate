import { TRBACActions, TRBACResources } from 'src/enums/permissions.enums'
import { TRBACRoles } from 'src/enums/roles.enums'
import { UserWithRolesSchema } from 'src/users/swagger/users.swagger'

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
              userWithRoles: UserWithRolesSchema
            }
          }
        }
      }
    }
  }
}

export const RoleWithPermissionsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: '89q3hderq3j09q2e...' },
    name: { type: 'string', example: TRBACRoles.MODERATOR },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    rolePermissions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '89q3hderq3j09q2e...' },
          roleId: { type: 'string', example: 'nionb98dghgh8...' },
          permissionId: { type: 'string', example: 'nihgds98h8fg9...' },
          createdAt: { type: 'string', format: 'date-time' },
          permission: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'cmpmxw5qx0003ek...' },
              action: { type: 'string', enum: Object.values(TRBACActions), example: TRBACActions.CREATE },
              resource: { type: 'string', enum: Object.values(TRBACResources), example: TRBACResources.USER },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }
}

export const RoleWithPermissionResponse = {
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
