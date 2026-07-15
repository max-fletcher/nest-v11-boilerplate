import { z } from 'zod'

export const UpdateCommentSchema = z.object({
  body: z.string({
    error: (issue) => (issue.input === undefined ? 'Body is required.' : 'Body must be a string.')
  })
})

export type TUpdateCommentZodValDto = z.infer<typeof UpdateCommentSchema>
export type TUpdateCommentBodyDto = TUpdateCommentZodValDto
export type TUpdateCommentUpdateDataDto = TUpdateCommentBodyDto & {
  userId: string
}
