import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string({
    error: (issue) => (issue.input === undefined ? 'Email is required' : 'Email must be a string')
  }),
  password: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Password is required' : 'Password must be a string')
    })
    .min(8, 'Password must be at least 8 characters')
    .max(50)
})

export type TLoginZodValDto = z.infer<typeof LoginSchema>
export type TLoginBodyDto = TLoginZodValDto
