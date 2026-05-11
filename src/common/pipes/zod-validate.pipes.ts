// zod-validation.pipe.ts
import { PipeTransform, UnprocessableEntityException } from '@nestjs/common'
import { ZodType } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType<unknown>) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value)

    if (!result.success) {
      const formattedErrors: Record<string, string> = {}

      result.error.issues.forEach((err) => {
        const field = String(err.path[0] ?? 'unknown')

        if (!formattedErrors[field]) {
          formattedErrors[field] = err.message
        }
      })

      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: formattedErrors
      })
    }

    return result.data
  }
}
