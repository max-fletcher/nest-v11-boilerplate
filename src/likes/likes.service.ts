import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from 'generated/prisma/client'
import { handlePrismaError } from 'src/utils/prisma/prisma.utils'
import { TGetLikesPaginateOrderByFields } from './types/pagination.types'
import { TGetLikesPaginateFields } from './enums/pagination.enums'
import { TPaginateOrderByValues } from 'src/types/paginate.types'
import { TPaginateOrderBy } from 'src/enums/pagination.enums'

@Injectable()
export class LikesService {
  constructor(
    private readonly prisma: PrismaService
    // private readonly redisService: RedisService,
    // private readonly configService: ConfigService
  ) {}

  async createOrRemove(data: Prisma.LikeUncheckedCreateInput) {
    try {
      const likeExists = await this.prisma.like.count({ where: { userId: data.userId, postId: data.postId } })

      if (likeExists) {
        const deletedLike = await this.prisma.like.deleteMany({ where: { userId: data.userId, postId: data.postId } })
        return deletedLike
      }

      const createdLike = await this.prisma.like.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      })

      return createdLike
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
    orderBy: TGetLikesPaginateOrderByFields | null = TGetLikesPaginateFields.CREATED_AT,
    order: TPaginateOrderByValues = TPaginateOrderBy.ASC
  ) {
    // const cacheKey = `${TLikesServiceCache.POST_PAGINATION_CACHE_PREFIX}limit:${limit}:page:${page}:orderBy:${orderBy}:order:${order}`
    // const cachedData = await this.redisService.getValue(cacheKey)
    // if (cachedData) {
    //   // check cache
    //   console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
    //   return cachedData
    // }

    const skip = (page - 1) * limit
    const options: Prisma.LikeFindManyArgs = {
      take: limit,
      skip,
      select: {
        id: true,
        userId: true,
        postId: true,
        createdAt: true
      }
    }
    if (orderBy)
      options['orderBy'] = {
        [orderBy]: order
      }

    const [likes, total] = await Promise.all([this.prisma.like.findMany(options), this.prisma.like.count()])
    const next = limit + skip < total
    const previous = page > 1

    const result = {
      limit: limit,
      page,
      total,
      next,
      previous,
      totalPages: Math.ceil(total / limit),
      likes
    }

    // await this.redisService.setValue(cacheKey, result, this.redisExpiry)
    // console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'Result data', result)

    return result
  }

  async findOneById(id: string) {
    // const cacheKey = `${TPost2ServiceCache.POST_SINGLE_CACHE_PREFIX}:${id}`
    // // check cache
    // const cachedData = (await this.redisService.getValue(cacheKey)) as TCachedFindUserById
    // if (cachedData) {
    //   console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
    //   return cachedData
    // }

    const like = await this.prisma.like.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        postId: true,
        createdAt: true
      }
    })
    if (!like) throw new NotFoundException(`Like with id ${id} not found.`)

    // await this.redisService.setValue(cacheKey, post, this.redisExpiry)
    // console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'Post data', post)

    return like
  }

  async remove(id: string, userId: string) {
    const likeExists = await this.prisma.like.findUnique({ where: { id } })
    if (!likeExists) throw new NotFoundException(`Like with id ${id} not found`)
    if (likeExists.userId !== userId) throw new ForbiddenException(`This like wasn't submitted by you`)

    const deletedLike = await this.prisma.like.delete({ where: { id } })

    // await this.redisService.invalidateByPrefix(TPost2ServiceCache.POST_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
    // await this.redisService.invalidateByPrefix(TPost2ServiceCache.POST_PAGINATION_CACHE_PREFIX) // invalidate cache

    return deletedLike
  }
}
