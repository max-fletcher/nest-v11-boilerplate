export const CreatePostValidationFailedResponse = {
  description: 'When request body+files validation fails for creating a post',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 422 },
      timestamp: { type: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/users' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Title is required.' },
                  content: { type: 'string', example: 'Content has to be string.' },
                  published: { type: 'boolean', default: true, example: true },
                  authorId: { type: 'string', example: '89q3hderq3j09q2e...' }
                }
              }
            }
          }
        }
      }
    }
  }
}

export const UpdatePostValidationFailedResponse = {
  description: 'When request body+files validation fails for updating a post',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 422 },
      timestamp: { type: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/users' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Title has to be of type string.' },
                  content: { type: 'string', example: 'Content has to be of type string.' },
                  published: { type: 'boolean', default: true, example: true },
                  authorId: { type: 'string', example: '89q3hderq3j09q2e...' }
                }
              }
            }
          }
        }
      }
    }
  }
}

export const CreatePostWithUserValidationFailedResponse = {
  description: 'When request body+files validation fails for creating a post with user',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 422 },
      timestamp: { type: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/users' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Title is required.' },
                  content: { type: 'string', example: 'Content has to be string.' },
                  published: { type: 'boolean', default: true, example: true },
                  authorId: { type: 'string', example: '89q3hderq3j09q2e...' },
                  name: { type: 'string', example: 'Name is required.' },
                  email: { type: 'string', example: 'Content is required.' },
                  password: { type: 'string', example: 'Password is required.' },
                  'avatar.0.originalname': { type: 'string', example: 'Invalid input' },
                  'avatar.0.mimetype': { type: 'string', example: 'Invalid input' },
                  'background.0.originalname': { type: 'string', example: 'Invalid input' },
                  'background.0.mimetype': { type: 'string', example: 'Invalid input' }
                }
              }
            }
          }
        }
      }
    }
  }
}
