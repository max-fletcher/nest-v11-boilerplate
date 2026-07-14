import { imageValidationRule } from 'src/common/zod/zod-rules.zod'
import { z } from 'zod'

export const CreatePost2Schema = z.object({
  body: z.string({
    error: (issue) => (issue.input === undefined ? 'Body is required.' : 'Body must be a string.')
  }),
  image: z.array(imageValidationRule).optional().nullable()
})

export type TCreatePost2ZodValDto = z.infer<typeof CreatePost2Schema>
export type TCreatePost2BodyDto = TCreatePost2ZodValDto
