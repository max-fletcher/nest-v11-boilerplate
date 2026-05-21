export enum TRBACRoles {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user'
}

export const TRBACRolesList = [TRBACRoles.ADMIN, TRBACRoles.MODERATOR, TRBACRoles.USER] as const
