import { imageValidationRule } from 'src/common/zod/zod-rules.zod'
import { z } from 'zod'

export const UpdateUserSchema = z.object({
  firstName: z
    .string({
      error: (issue) => (issue.input === undefined ? 'First name is required' : 'First name must be a string')
    })
    .min(3, 'First name must be at least 3 characters')
    .max(300)
    .optional(),
  lastName: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Last name is required' : 'Last name must be a string')
    })
    .min(3, 'Last name must be at least 3 characters')
    .max(300)
    .optional(),
  email: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Email is required' : 'Email must be a string')
    })
    .optional(),
  password: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Password is required' : 'Password must be a string')
    })
    .min(8, 'Password must be at least 8 characters')
    .max(50)
    .optional(),
  avatar: z.array(imageValidationRule).optional().nullable(),
  background: z.array(imageValidationRule).optional().nullable()
})

export type TUpdateUserZodValDto = z.infer<typeof UpdateUserSchema>
export type TUpdateUserBodyDto = Omit<TUpdateUserZodValDto, 'avatar' | 'background'>
export type TUpdateUserUpdateDataDto = TUpdateUserBodyDto & {
  avatar: string | null | undefined
  background: string | null | undefined
}
