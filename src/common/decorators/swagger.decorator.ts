import { applyDecorators } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { UnauthorizedAccessResponse } from '../swagger/auth.swagger'
import { BadRequestResponse, ConflictResponse, InternalServerErrorResponse, NotFoundResponse, RateLimitExceededResponse } from '../swagger/general-errors.swagger'

// General error response formats for swagger
export function SwaggerGeneralErrorResponses() {
  return applyDecorators(
    ApiUnauthorizedResponse(UnauthorizedAccessResponse),
    ApiInternalServerErrorResponse(InternalServerErrorResponse),
    ApiTooManyRequestsResponse(RateLimitExceededResponse),
    ApiConflictResponse(ConflictResponse),
    ApiNotFoundResponse(NotFoundResponse),
    ApiBadRequestResponse(BadRequestResponse)
  )
}
