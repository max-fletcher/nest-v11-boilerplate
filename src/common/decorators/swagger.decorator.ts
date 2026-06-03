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
import { PAGINATE_ORDER_BY, TPaginateOrderBy } from 'src/enums/pagination.enums'

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
export function SwaggerPaginationQueryParams(orderByEnum: readonly string[]) {
  return applyDecorators(
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1
    }),
    ApiQuery({
      name: 'orderBy',
      required: false,
      enum: orderByEnum,
      example: orderByEnum[0]
    }),
    ApiQuery({
      name: 'order',
      required: false,
      enum: PAGINATE_ORDER_BY,
      example: TPaginateOrderBy.ASC
    })
  )
}
