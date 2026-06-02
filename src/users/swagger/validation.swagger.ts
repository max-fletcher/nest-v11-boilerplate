export const CreateUserValidationFailedResponse = {
  description: 'When request body+files validation fails',
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
                  name: { type: 'string', example: 'John doe1' },
                  email: { type: 'string', example: 'johndoe1@mail.com' },
                  password: { type: 'string', example: 'password' },
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
