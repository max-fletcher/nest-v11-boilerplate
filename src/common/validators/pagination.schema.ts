// common/schemas/pagination.schema.ts

import { z } from 'zod'

import { PAGINATE_ORDER_BY, TPaginateOrderBy } from 'src/enums/pagination.enums'
// see pagination-type.txt for an explanation of the types used here

export const PaginationSchema = <T extends readonly [string, ...string[]]>(orderByFields: T, defaultOrderBy: T[number]) => {
  return z.object({
    limit: z.coerce.number().min(1, 'Limit must be greater than 1').default(10),
    page: z.coerce.number().min(1, 'Page must be greater than 1').default(1),
    orderBy: z.enum(orderByFields).default(defaultOrderBy),
    order: z.enum(PAGINATE_ORDER_BY).default(TPaginateOrderBy.ASC)
  })
}

export type TPaginationZodValDto = z.infer<ReturnType<typeof PaginationSchema>>
