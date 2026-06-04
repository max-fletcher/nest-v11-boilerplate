export const AssignPermissionsToRoleValidationFailedResponse = {
  description: 'When request body+files validation fails for assiging permissions to a role',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      status: { type: 'number', example: 422 },
      timestamp: { type: 'string', format: 'date-time', example: '2026-06-02T18:32:57.025Z' },
      path: { type: 'string', example: '/api/v1/permissions/assign-permissions-to-role' },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'object',
            properties: {
              roleId: { type: 'string', example: 'Role id is required.' },
              resource: { type: 'string', example: 'Resources is required.' },
              addActions: { type: 'string', example: 'Add actions is required.' },
              removeRoles: { type: 'string', example: 'Remove actions is required.' }
            }
          }
        }
      }
    }
  }
}
