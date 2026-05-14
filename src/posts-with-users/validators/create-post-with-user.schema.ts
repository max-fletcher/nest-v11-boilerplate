import { CreateUserBaseSchema } from 'src/users/validators/create-user.schema'
import { z } from 'zod'
import { CreatePostBaseSchema } from './create-post.schema'
import { PrismaService } from 'src/prisma/prisma.service'

export const CreatePostWithUserBaseSchema = CreateUserBaseSchema.extend(CreatePostBaseSchema.omit({ authorId: true }).shape)

export const CreatePostWithUserSchema = (prisma: PrismaService) =>
  CreatePostWithUserBaseSchema.superRefine(async (data, ctx) => {
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })
      if (existingUser) {
        ctx.addIssue({
          code: 'custom',
          message: 'User with this email already exists.',
          path: ['email'] // ✅ error will be on the email field specifically
        })
      }
    }
  })

export type TCreatePostWithUserZodValDto = z.infer<ReturnType<typeof CreatePostWithUserSchema>>
export type TCreatePostWithUserBodyDto = TCreatePostWithUserZodValDto
export type TCreatePostWithUserStoreDataDto = TCreatePostWithUserBodyDto & {
  avatar: string | undefined
  background: string | undefined
}
