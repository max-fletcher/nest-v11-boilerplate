import { imageValidationRule } from 'src/common/zod/zod-rules.zod'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

export const CreateUserBaseSchema = z.object({
  firstName: z
    .string({
      error: (issue) => (issue.input === undefined ? 'First name is required.' : 'First name must be a string.')
    })
    .min(3, 'First name must be at least 3 characters')
    .max(300),
  lastName: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Last name is required.' : 'Last name must be a string.')
    })
    .min(3, 'Last name must be at least 3 characters')
    .max(300),
  email: z.string({
    error: (issue) => (issue.input === undefined ? 'Email is required.' : 'Email must be a string.')
  }),
  password: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Password is required.' : 'Password must be a string.')
    })
    .min(8, 'Password must be at least 8 characters.')
    .max(50),
  avatar: z.array(imageValidationRule).optional().nullable(),
  background: z.array(imageValidationRule).optional().nullable()
})

export const CreateUserSchema = (prisma: PrismaService) =>
  CreateUserBaseSchema.superRefine(async (data, ctx) => {
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })
      if (existingUser) {
        ctx.addIssue({
          code: 'custom',
          message: 'User with this email already exists.',
          path: ['email']
        })
      }
    }
  })

export type TCreateUserZodValDto = z.infer<ReturnType<typeof CreateUserSchema>>
export type TCreateUserBodyDto = Omit<TCreateUserZodValDto, 'avatar' | 'background'>
export type TCreateUserStoreDataDto = TCreateUserBodyDto & {
  avatar: string | undefined
  background: string | undefined
}
