export const BadRequestResponse = {
  description: 'When a bad request reaches the server',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 400 },
      timestamp: { type: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/users' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Incorrect data format.' },
          error: { type: 'string', example: 'Bad Request' }
        }
      }
    }
  }
}

export const NotFoundResponse = {
  description: 'When a database resource is not found',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 404 },
      timestamp: { type: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/users/cmpmxw5u5000yekvhjf3r0ge9' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'User with id cmpmxw5u5000yekvhjf3r0ge9 not found.' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    }
  }
}

export const ConflictResponse = {
  description: 'When a unique constraint in database is violated',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 409 },
      timestamp: { type: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/users' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'A record with this value already exists' },
          error: { type: 'string', example: 'Conflict' }
        }
      }
    }
  }
}

export const RateLimitExceededResponse = {
  description: 'When rate-limit is exceeded',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 429 },
      timestamp: { type: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/users' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'ThrottlerException: Too Many Requests' }
        }
      }
    }
  }
}

export const InternalServerErrorResponse = {
  description: 'When unauthorized access is blocked by authention guard',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 500 },
      timestamp: { type: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/users' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Something went wrong' },
          error: { type: 'string', example: 'Internal Server Error' }
        }
      }
    }
  }
}
