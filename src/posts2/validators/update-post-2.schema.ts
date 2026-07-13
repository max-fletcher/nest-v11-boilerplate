import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

export const UpdatePost2Schema = (prisma: PrismaService) =>
  z
    .object({
      body: z
        .string({
          error: () => 'Body must be a string.'
        })
        .optional(),
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

export type TUpdatePost2ZodValDto = z.infer<ReturnType<typeof UpdatePost2Schema>>
export type TUpdatePost2BodyDto = TUpdatePost2ZodValDto
export type TUpdatePost2UpdateDataDto = TUpdatePost2BodyDto & {
  image: string | null | undefined
}
