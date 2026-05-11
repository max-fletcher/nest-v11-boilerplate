export enum TPaginateOrderBy {
  ASC = 'asc',
  DESC = 'desc'
}

export const PAGINATE_ORDER_BY = [TPaginateOrderBy.ASC, TPaginateOrderBy.DESC] as const
