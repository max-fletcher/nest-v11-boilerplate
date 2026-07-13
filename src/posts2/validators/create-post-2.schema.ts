import { imageValidationRule } from 'src/common/zod/zod-rules.zod'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

export const CreatePost2BaseSchema = z.object({
  body: z.string({
    error: (issue) => (issue.input === undefined ? 'Body is required.' : 'Body must be a string.')
  }),
  authorId: z.string({
    error: (issue) => (issue.input === undefined ? 'Author id is required.' : 'Author id must be a string.')
  }),
  image: z.array(imageValidationRule).optional().nullable()
})

export const CreatePost2Schema = (prisma: PrismaService) =>
  CreatePost2BaseSchema.superRefine(async (data, ctx) => {
    const existingUser = await prisma.user.findUnique({
      where: { id: data.authorId }
    })
    if (!existingUser) {
      ctx.addIssue({
        code: 'custom',
        message: 'Author not found.',
        path: ['authorId']
      })
    }
  })

export type TCreatePost2ZodValDto = z.infer<ReturnType<typeof CreatePost2Schema>>
export type TCreatePost2BodyDto = TCreatePost2ZodValDto
