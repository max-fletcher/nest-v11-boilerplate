import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from 'generated/prisma/client'
import { type TGetCommentsPaginateOrderByFields } from 'src/comments/types/pagination.types'
import { type TPaginateOrderByValues } from 'src/types/paginate.types'
import { TPaginateOrderBy } from 'src/enums/pagination.enums'
import { handlePrismaError } from 'src/utils/prisma/prisma.utils'
import { PrismaService } from 'src/prisma/prisma.service'
import { TGetCommentsPaginateFields } from './enums/pagination.enums'

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService
    // private readonly redisService: RedisService,
    // private readonly configService: ConfigService
  ) {}

  async create(data: Prisma.CommentUncheckedCreateInput) {
    try {
      const createdComment = await this.prisma.comment.create({ data })

      return createdComment
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error)
      }
      throw error
    }
  }

  async findAll(
    limit = 10,
    page = 1,
    orderBy: TGetCommentsPaginateOrderByFields | null = TGetCommentsPaginateFields.CREATED_AT,
    order: TPaginateOrderByValues = TPaginateOrderBy.ASC
  ) {
    // const cacheKey = `${TCommentsServiceCache.COMMENTS_PAGINATION_CACHE_PREFIX}limit:${limit}:page:${page}:orderBy:${orderBy}:order:${order}`
    // const cachedData = await this.redisService.getValue(cacheKey)
    // if (cachedData) {
    //   // check cache
    //   console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
    //   return cachedData
    // }

    const skip = (page - 1) * limit
    const options: Prisma.CommentFindManyArgs = {
      take: limit,
      skip,
      select: {
        id: true,
        userId: true,
        postId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    }
    if (orderBy)
      options['orderBy'] = {
        [orderBy]: order
      }

    const [comments, total] = await Promise.all([this.prisma.comment.findMany(options), this.prisma.comment.count()])
    const next = limit + skip < total
    const previous = page > 1

    const result = {
      limit: limit,
      page,
      total,
      next,
      previous,
      totalPages: Math.ceil(total / limit),
      comments
    }

    // await this.redisService.setValue(cacheKey, result, this.redisExpiry)
    // console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'Result data', result)

    return result
  }

  async findOneById(id: string) {
    // const cacheKey = `${TCommentsServiceCache.POST_SINGLE_CACHE_PREFIX}:${id}`
    // // check cache
    // const cachedData = (await this.redisService.getValue(cacheKey)) as TCachedFindUserById
    // if (cachedData) {
    //   console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
    //   return cachedData
    // }

    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        postId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    if (!comment) throw new NotFoundException(`Comment with id ${id} not found.`)

    // await this.redisService.setValue(cacheKey, comment, this.redisExpiry)
    // console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'Comment data', comment)

    return comment
  }

  async update(id: string, data: Prisma.CommentUncheckedUpdateInput) {
    try {
      const commentExists = await this.prisma.comment.count({ where: { id } })
      if (!commentExists) throw new NotFoundException(`Comment with id ${id} not found.`)

      const updatedPost = await this.prisma.comment.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      // await this.redisService.invalidateByPrefix(TCommentServiceCache.POST_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
      // await this.redisService.invalidateByPrefix(TCommentServiceCache.POST_PAGINATION_CACHE_PREFIX) // invalidate cache

      return updatedPost
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error)
      }
      throw error
    }
  }

  async remove(id: string, userId: string) {
    const commentExists = await this.prisma.comment.findUnique({ where: { id } })
    if (!commentExists) throw new NotFoundException(`Comment with id ${id} not found`)
    if (commentExists.userId !== userId) throw new ForbiddenException(`This comment wasn't submitted by you`)

    const deletedComment = await this.prisma.comment.delete({ where: { id } })

    // await this.redisService.invalidateByPrefix(TPost2ServiceCache.POST_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
    // await this.redisService.invalidateByPrefix(TPost2ServiceCache.POST_PAGINATION_CACHE_PREFIX) // invalidate cache

    return deletedComment
  }
}
