import { HttpStatus } from '@nestjs/common'

export type TThrownExceptionResponse = {
  message: string | string[]
  errors?: unknown
  error: string
}

export type TValidationExceptionResponse = {
  response?: {
    message: string
    errors?: unknown
  }
}

export type TExceptionResponse = null | TThrownExceptionResponse | TValidationExceptionResponse

// A typescript type
export type TErrorResponse = {
  success: boolean
  status: HttpStatus
  timestamp: string
  path: string
  response: TExceptionResponse | string
}
