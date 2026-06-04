const UserRegisterProperties = {
  name: {
    type: 'string',
    example: 'John Doe1'
  },
  email: {
    type: 'string',
    example: 'johndoe1@mail.com'
  },
  password: {
    type: 'password',
    example: 'password'
  },
  confirmPassword: {
    type: 'password',
    example: 'password'
  }
}

export const UserRegisterPropertiesBody = {
  schema: {
    type: 'object',
    required: ['name', 'email', 'password', 'confirmPassword'],
    properties: UserRegisterProperties
  }
}

// Login, registration or refresh token response
export const AuthSuccessfulResponse = {
  description: 'When a user registers/logs in/logs out to/from the application successfully',
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
              access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...' },
              refresh_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...' },
              user: {
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

const UserLoginProperties = {
  email: {
    type: 'string',
    example: 'johndoe1@mail.com'
  },
  password: {
    type: 'password',
    example: 'password'
  }
}

export const UserLoginPropertiesBody = {
  schema: {
    type: 'object',
    required: ['email', 'password'],
    properties: UserLoginProperties
  }
}

export const LogoutSuccessfulResponse = {
  description: 'When a user logs out from the application successfully',
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
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '89q3hderq3j09q2e...' },
                  email: { type: 'string', example: 'johndoe1@mail.com' },
                  name: { type: 'string', example: 'John doe1' }
                }
              }
            }
          }
        }
      }
    }
  }
}
