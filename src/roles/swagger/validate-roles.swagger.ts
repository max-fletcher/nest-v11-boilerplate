export const AssignRolesToUsersValidationFailedResponse = {
  description: 'When request body+files validation fails for creating a post',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 422 },
      timestamp: { type: 'string', format: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/roles/assign-role-to-user' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'object',
            properties: {
              userId: { type: 'string', example: 'User id is required.' },
              assignRoles: { type: 'string', example: 'Some assign role ids are invalid.' },
              removeRoles: { type: 'string', example: 'Some assign role ids are invalid.' }
            }
          }
        }
      }
    }
  }
}
