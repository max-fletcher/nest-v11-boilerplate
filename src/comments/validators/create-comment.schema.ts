import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

export const CreateCommentBaseSchema = z.object({
  body: z.string({
    error: (issue) => (issue.input === undefined ? 'Body is required.' : 'Body must be a string.')
  }),
  postId: z.string({
    error: (issue) => (issue.input === undefined ? 'Post id is required.' : 'Post id must be a string.')
  })
})

export const CreateCommentSchema = (prisma: PrismaService) =>
  CreateCommentBaseSchema.superRefine(async (data, ctx) => {
    const existingPost = await prisma.post2.findUnique({
      where: { id: data.postId }
    })
    if (!existingPost) {
      ctx.addIssue({
        code: 'custom',
        message: 'Post not found.',
        path: ['postId']
      })
    }
  })

export type TCreateCommentZodValDto = z.infer<ReturnType<typeof CreateCommentSchema>>
export type TCreateCommentBodyDto = TCreateCommentZodValDto
