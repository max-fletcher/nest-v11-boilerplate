import { TGetPostsWithUserPaginateFields } from '../enums/pagination.enums'

export type TGetPostsWithUsersPaginateOrderByFields =
  | TGetPostsWithUserPaginateFields.TITLE
  | TGetPostsWithUserPaginateFields.CONTENT
  | TGetPostsWithUserPaginateFields.PUBLISHED
  | TGetPostsWithUserPaginateFields.CREATED_AT
