import { applyDecorators } from '@nestjs/common'
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiTooManyRequestsResponse, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { UnauthorizedAccessResponse } from '../swagger/auth.swagger'
import { BadRequestResponse, InternalServerErrorResponse, NotFoundResponse, RateLimitExceededResponse } from '../swagger/general-errors.swagger'

// General error response formats for swagger
export function SwaggerGeneralErrorResponses() {
  return applyDecorators(
    ApiUnauthorizedResponse(UnauthorizedAccessResponse),
    ApiInternalServerErrorResponse(InternalServerErrorResponse),
    ApiTooManyRequestsResponse(RateLimitExceededResponse),
    ApiNotFoundResponse(NotFoundResponse),
    ApiBadRequestResponse(BadRequestResponse)
  )
}
