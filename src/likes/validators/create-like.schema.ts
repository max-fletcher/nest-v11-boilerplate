import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

export const CreateLikeBaseSchema = z.object({
  postId: z.string({
    error: (issue) => (issue.input === undefined ? 'Author id is required.' : 'Author id must be a string.')
  })
})

export const CreateLikeSchema = (prisma: PrismaService) =>
  CreateLikeBaseSchema.superRefine(async (data, ctx) => {
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

export type TCreateLikeZodValDto = z.infer<ReturnType<typeof CreateLikeSchema>>
export type TCreateLikeBodyDto = TCreateLikeZodValDto
