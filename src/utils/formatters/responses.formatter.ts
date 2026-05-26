import { HttpStatus } from '@nestjs/common'

export const formattedResponse = (data: Record<string, unknown>, status: number = HttpStatus.OK, message: string = 'Success') => {
  return {
    success: true,
    status,
    response: {
      message,
      data
    }
  }
}
