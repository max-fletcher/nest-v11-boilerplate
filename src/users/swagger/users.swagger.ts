export const CreateUserBody = {
  schema: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
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
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'John doe1' },
                  name: { type: 'string', example: 'John doe1' },
                  email: { type: 'string', example: 'johndoe1@mail.com' },
                  password: { type: 'password', example: 'password' },
                  avatar: { type: 'binary' },
                  background: { type: 'binary' },
                  hashedRefreshToken: { type: 'string', example: 'n9d98q23he801ju21...' },
                  createdAt: { type: 'datetime' },
                  updatedAt: { type: 'datetime' }
                }
              }
            }
          }
        }
      }
    }
  }
}
