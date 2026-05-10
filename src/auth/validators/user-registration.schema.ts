import { z } from 'zod'

export const RegistrationSchema = z.object({
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
    .max(50)
})

export type TRegistrationZodValDto = z.infer<typeof RegistrationSchema>
export type TRegistrationBodyDto = TRegistrationZodValDto
