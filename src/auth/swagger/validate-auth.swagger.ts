export const RegistrationValidationFailedResponse = {
  description: 'When request validation fails for user registration',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 422 },
      timestamp: { type: 'string', format: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/auth/registration' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Name is required' },
              email: { type: 'string', example: 'Email is required' },
              password: { type: 'string', example: 'Password is required' },
              confirmPassword: { type: 'string', example: 'Password confirmation is required' }
            }
          }
        }
      }
    }
  }
}

export const LoginValidationFailedResponse = {
  description: 'When request validation fails for user login',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 422 },
      timestamp: { type: 'string', format: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/auth/login' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'object',
            properties: {
              email: { type: 'string', example: 'Email is required' },
              password: { type: 'string', example: 'Password is required' }
            }
          }
        }
      }
    }
  }
}
