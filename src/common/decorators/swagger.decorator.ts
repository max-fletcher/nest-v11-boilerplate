import { applyDecorators } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { UnauthorizedAccessResponse } from '../swagger/auth.swagger'
import { BadRequestResponse, InternalServerErrorResponse, NotFoundResponse, RateLimitExceededResponse } from '../swagger/general-errors.swagger'
import { TGetPostsWithUserPaginateFields } from 'src/posts-with-users/enums/pagination.enums'
import { TPaginateOrderBy } from 'src/enums/pagination.enums'

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

// Query params definitions for pagination fns for swagger
export function SwaggerPaginationQueryParams() {
  return applyDecorators(
    ApiQuery({
      name: 'limit',
      required: false,
      example: 1
    }),
    ApiQuery({
      name: 'page',
      required: false,
      example: 10
    }),
    ApiQuery({
      name: 'orderBy',
      required: false,
      example: TGetPostsWithUserPaginateFields.TITLE
    }),
    ApiQuery({
      name: 'order',
      required: false,
      example: TPaginateOrderBy.ASC
    })
  )
}
