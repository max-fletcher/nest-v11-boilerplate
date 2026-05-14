// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { type User } from 'generated/prisma/client'
import { Request } from 'express'

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>()
  return request.user
})

export type TCurrentUserType = Omit<User, 'password' | 'createdAt' | 'updatedAt'>
