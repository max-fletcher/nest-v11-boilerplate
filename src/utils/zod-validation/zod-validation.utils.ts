import { HttpException, UnprocessableEntityException } from '@nestjs/common'
import { ZodType, ZodError } from 'zod'

export const validateWithZod = async <T>(schema: ZodType<T>, data: unknown) => {
  try {
    const result = await schema.parseAsync(data)
    return result
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors: Record<string, string> = {}
      error.issues.forEach((err) => {
        const field = err.path.join('.') || 'unknown'
        if (!formattedErrors[field]) {
          formattedErrors[field] = err.message
        }
      })
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: formattedErrors // ✅ now matches ZodValidationPipe
      })
    } else {
      throw new HttpException('Something went wrong.', 500)
    }
  }
}
