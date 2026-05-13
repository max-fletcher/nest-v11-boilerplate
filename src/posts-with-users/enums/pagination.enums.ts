export enum TGetPostsWithUserPaginateFields {
  TITLE = 'title',
  CONTENT = 'content',
  PUBLISHED = 'published',
  CREATED_AT = 'createdAt'
}

export const GET_POSTS_WITH_USER_PAGINATED_FIELDS = [
  TGetPostsWithUserPaginateFields.TITLE,
  TGetPostsWithUserPaginateFields.CONTENT,
  TGetPostsWithUserPaginateFields.PUBLISHED,
  TGetPostsWithUserPaginateFields.CREATED_AT
] as const
