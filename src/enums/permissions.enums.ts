export enum TRBACActions {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

export enum TRBACResources {
  USER = 'user',
  POST = 'post',
  ROLES = 'roles',
  PERMISSIONS = 'permissions'
}

export type TRBACPermission = {
  action: TRBACActions
  resource: TRBACResources
}
