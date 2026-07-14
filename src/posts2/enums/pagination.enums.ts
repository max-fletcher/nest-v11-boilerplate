export enum TGetPosts2PaginateFields {
  BODY = 'body',
  CREATED_AT = 'createdAt'
}

export const GET_POSTS2_PAGINATED_FIELDS = [TGetPosts2PaginateFields.BODY, TGetPosts2PaginateFields.CREATED_AT] as const
