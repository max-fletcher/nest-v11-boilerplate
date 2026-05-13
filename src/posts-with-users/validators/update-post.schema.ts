import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

export const UpdatePostSchema = (prisma: PrismaService) =>
  z
    .object({
      title: z
        .string({
          error: () => 'Title must be a string.'
        })
        .min(3, 'title must be at least 3 characters')
        .max(300)
        .optional(),
      content: z
        .string({
          error: () => 'Content must be a string.'
        })
        .optional()
        .nullable(),
      published: z.coerce
        .boolean({
          error: () => 'Published must be a boolean.'
        })
        .default(true),
      authorId: z
        .string({
          error: () => 'Author id must be a string.'
        })
        .optional()
    })
    .superRefine(async (data, ctx) => {
      if (data.authorId) {
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
      }
    })

export type TUpdatePostZodValDto = z.infer<ReturnType<typeof UpdatePostSchema>>
export type TUpdatePostBodyDto = TUpdatePostZodValDto
