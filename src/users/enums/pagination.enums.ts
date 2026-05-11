export enum TGetUsersPaginateFields {
  NAME = 'name',
  EMAIL = 'email',
  CREATED_AT = 'createdAt'
}

export const GET_USERS_PAGINATED_FIELDS = [TGetUsersPaginateFields.NAME, TGetUsersPaginateFields.EMAIL, TGetUsersPaginateFields.CREATED_AT] as const
