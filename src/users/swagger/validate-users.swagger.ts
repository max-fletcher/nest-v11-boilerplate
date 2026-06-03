export const CreateUserValidationFailedResponse = {
  description: 'When request body+files validation fails for creating a user',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 422 },
      timestamp: { type: 'string', format: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/users' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Name is required.' },
              email: { type: 'string', example: 'Email is required.' },
              password: { type: 'string', example: 'password is required.' },
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

export const UpdateUserValidationFailedResponse = {
  description: 'When request body+files validation fails for updating a user',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 422 },
      timestamp: { type: 'string', format: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/users' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Invalid Input' },
              email: { type: 'string', example: 'Invalid Input' },
              password: { type: 'string', example: 'Invalid Input' },
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
