import { imageValidationRule } from 'src/common/zod/zod-rules.zod'
import { z } from 'zod'

export const UpdatePost2Schema = z.object({
  body: z
    .string({
      error: () => 'Body must be a string.'
    })
    .optional(),
  image: z.array(imageValidationRule).optional().nullable()
})

export type TUpdatePost2ZodValDto = z.infer<typeof UpdatePost2Schema>
export type TUpdatePost2BodyDto = TUpdatePost2ZodValDto
export type TUpdatePost2UpdateDataDto = Omit<TUpdatePost2BodyDto, 'image'> & {
  authorId: string
  image: string | null | undefined
}
