import { z } from 'zod'
import { PrismaService } from 'src/prisma/prisma.service'

// *IMPORTANT: If you want to use superrefine with your schema with nest and prisma, you need to define this as a function
// that returns a schema like this here. Also, any derived types has to use "ReturnType"(see TRegistrationZodValDto below).
//
export const RegistrationSchema = (prisma: PrismaService) =>
  z
    .object({
      name: z
        .string({
          error: (issue) => (issue.input === undefined ? 'Name is required' : 'Name must be a string')
        })
        .min(3, 'Name must be at least 3 characters')
        .max(300),
      email: z.string({
        error: (issue) => (issue.input === undefined ? 'Email is required' : 'Email must be a string')
      }),
      password: z
        .string({
          error: (issue) => (issue.input === undefined ? 'Password is required' : 'Password must be a string')
        })
        .min(8, 'Password must be at least 8 characters')
        .max(50),
      confirmPassword: z
        .string({
          error: (issue) => (issue.input === undefined ? 'Password confirmation is required' : 'Password confirmation must be a string')
        })
        .min(8, 'Password confirmation must be at least 8 characters')
        .max(50)
    })
    .superRefine(async (data, ctx) => {
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

      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'Passwords do not match.',
          path: ['password']
        })
        ctx.addIssue({
          code: 'custom',
          message: 'Passwords do not match.',
          path: ['confirmPassword']
        })
      }
    })
    // getting rid of confirm_password after validation
    .transform((data) => {
      const { confirmPassword, ...rest } = data
      void confirmPassword
      return rest
    })

export type TRegistrationZodValDto = z.infer<ReturnType<typeof RegistrationSchema>>
export type TRegistrationBodyDto = TRegistrationZodValDto
