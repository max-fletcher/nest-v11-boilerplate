export enum TRBACActions {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

export enum TRBACResources {
  USER = 'user',
  POST = 'post',
  ROLES = 'role',
  PERMISSIONS = 'permission'
}

export type TRBACPermission = {
  action: TRBACActions
  resource: TRBACResources
}
