export enum TRolesPaginateFields {
  NAME = 'name',
  CREATED_AT = 'createdAt'
}

export const GET_ROLES_PAGINATED_FIELDS = [TRolesPaginateFields.NAME, TRolesPaginateFields.CREATED_AT] as const
