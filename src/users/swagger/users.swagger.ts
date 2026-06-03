import { TRBACActions, TRBACResources } from 'src/enums/permissions.enums'
import { TRBACRoles } from 'src/enums/roles.enums'

export const createAndUpdateUserProperties = {
  name: {
    type: 'string',
    example: 'John Doe1'
  },
  email: {
    type: 'string',
    example: 'johndoe1@mail.com'
  },
  password: {
    type: 'string',
    example: 'password'
  },
  avatar: {
    type: 'string',
    format: 'binary',
    description: 'Optional avatar image'
  },
  background: {
    type: 'string',
    format: 'binary',
    description: 'Optional background image'
  }
}

export const CreateUserBody = {
  schema: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: createAndUpdateUserProperties
  }
}

export const UpdateUserBody = {
  schema: {
    type: 'object',
    properties: createAndUpdateUserProperties
  }
}

const SingleUserDataSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '89q3hderq3j09q2e...' },
        name: { type: 'string', example: 'John doe1' },
        email: { type: 'string', example: 'johndoe1@mail.com' },
        avatar: {
          type: 'string',
          nullable: true,
          example: 'http://localhost:3000/uploads/files/1780489784748-bb3c64e8-41c7-4155-8720-047c34b4db77-sdfg4w.PNG'
        },
        background: {
          type: 'string',
          nullable: true,
          example: 'http://localhost:3000/uploads/files/1780489784748-bb3c64e8-41c7-4155-8720-047c34b4db77-sdfg4w.PNG'
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  }
}

export const FindSingleUserResponse = {
  description: 'When single a user is fetched successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      status: { type: 'number', example: 200 },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' },
          data: SingleUserDataSchema
        }
      }
    }
  }
}

export const UserCreatedResponse = {
  description: 'When user is created successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      status: { type: 'number', example: 201 },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' },
          data: SingleUserDataSchema
        }
      }
    }
  }
}

export const UserUpdatedResponse = {
  description: 'When a user is updated successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      status: { type: 'number', example: 200 },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' },
          data: SingleUserDataSchema
        }
      }
    }
  }
}

export const UserDeletedResponse = {
  description: 'When user is deleted successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      status: { type: 'number', example: 200 },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' },
          data: SingleUserDataSchema
        }
      }
    }
  }
}

export const GetPaginatedUsersListResponse = {
  description: `When user's list is fetched successfully`,
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
              loggedInUser: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '89q3hderq3j09q2e...' },
                  name: { type: 'string', example: 'John doe1' },
                  email: { type: 'string', example: 'johndoe1@mail.com' },
                  avatar: {
                    type: 'string',
                    nullable: true,
                    example: 'http://localhost:3000/uploads/files/1780489784748-bb3c64e8-41c7-4155-8720-047c34b4db77-sdfg4w.PNG'
                  },
                  background: {
                    type: 'string',
                    nullable: true,
                    example: 'http://localhost:3000/uploads/files/1780489784748-bb3c64e8-41c7-4155-8720-047c34b4db77-sdfg4w.PNG'
                  }
                }
              },
              paginatedUsers: {
                type: 'object',
                properties: {
                  limit: { type: 'number', example: 10, default: 1 },
                  page: { type: 'number', example: 1, default: 1 },
                  total: { type: 'number', example: 100 },
                  next: { type: 'boolean', example: true },
                  previous: { type: 'boolean', example: false },
                  totalpages: { type: 'number', example: 10 },
                  users: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '89q3hderq3j09q2e...' },
                        name: { type: 'string', example: 'John doe1' },
                        email: { type: 'string', example: 'johndoe1@mail.com' },
                        createdAt: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
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

export const UserWithRolesSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: '89q3hderq3j09q2e...' },
    email: { type: 'string', example: 'johndoe1@mail.com' },
    name: { type: 'string', example: 'John doe1' },
    avatar: {
      type: 'string',
      nullable: true,
      example: 'http://localhost:3000/uploads/files/1780489784748-bb3c64e8-41c7-4155-8720-047c34b4db77-sdfg4w.PNG'
    },
    background: {
      type: 'string',
      nullable: true,
      example: 'http://localhost:3000/uploads/files/1780489784748-bb3c64e8-41c7-4155-8720-047c34b4db77-sdfg4w.PNG'
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    userRoles: {
      type: 'array',
      items: RoleWithPermissionsSchema
    }
  }
}

export const UserWithRoleResponse = {
  description: 'When a user with roles and permissions is fetched successfully',
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
              userWithRole: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '89q3hderq3j09q2e...' },
                  userId: { type: 'string', example: 'fdjgdh0214214...' },
                  roleId: { type: 'string', example: 'nionb98dghgh8...' },
                  createdAt: { type: 'string', format: 'date-time' },
                  role: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '89q3hderq3j09q2e...' },
                        name: { type: 'string', example: 'John doe1' },
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
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
