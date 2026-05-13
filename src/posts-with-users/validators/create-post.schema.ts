import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

export const CreatePostSchema = (prisma: PrismaService) =>
  z
    .object({
      title: z
        .string({
          error: (issue) => (issue.input === undefined ? 'Title is required.' : 'Title must be a string.')
        })
        .min(3, 'title must be at least 3 characters')
        .max(300),
      content: z
        .string({
          error: (issue) => (issue.input === undefined ? 'Content is required.' : 'Content must be a string.')
        })
        .optional()
        .nullable(),
      published: z.coerce
        .boolean({
          error: () => 'Published must be a boolean.'
        })
        .default(true),
      authorId: z.string({
        error: (issue) => (issue.input === undefined ? 'Author id is required.' : 'Author id must be a string.')
      })
    })
    .superRefine(async (data, ctx) => {
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

export type TCreatePostZodValDto = z.infer<ReturnType<typeof CreatePostSchema>>
export type TCreatePostBodyDto = TCreatePostZodValDto
