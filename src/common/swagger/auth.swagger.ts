export const UnauthorizedAccessResponse = {
  description: 'When unauthorized access is blocked by guards e.g authentication and RBAC',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 401 },
      timestamp: { type: 'string', format: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/users' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Invalid token. Please log in again.' },
          error: { type: 'string', example: 'Unauthorized' }
        }
      }
    }
  }
}
