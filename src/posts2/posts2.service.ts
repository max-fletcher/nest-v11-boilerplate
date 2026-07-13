import { Injectable, NotFoundException } from '@nestjs/common'
import { Post2, Prisma, User } from 'generated/prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { handlePrismaError } from 'src/utils/prisma/prisma.utils'
import { type TPaginateOrderByValues } from 'src/types/paginate.types'
import { type TGetPosts2PaginateOrderByFields } from './types/pagination.types'
import { TGetPosts2PaginateFields } from './enums/pagination.enums'
import { TPaginateOrderBy } from 'src/enums/pagination.enums'
import { TPaginationZodValDto } from 'src/common/validators/pagination.schema'
import { RedisService } from 'src/redis/redis.service'
import { TPost2ServiceCache } from 'src/posts2/enums/cache.enums'
import { TUserServiceCache } from 'src/users/enums/cache.enums'
import { ConfigService } from '@nestjs/config'

type TCachedFindUserById = Omit<Post2, 'authorId' | 'updatedAt'> & {
  author: Omit<User, 'password' | 'hashedRefreshToken' | 'avatar' | 'background' | 'createdAt' | 'updatedAt'>
}

@Injectable()
export class Posts2Service {
  private readonly redisExpiry: number | null
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService
  ) {
    this.redisExpiry = this.configService.getOrThrow<string>('REDIS_CACHE_EXPIRY') ? Number(this.configService.getOrThrow<string>('REDIS_CACHE_EXPIRY')) : null
  }
  // PostUncheckedCreateInput
  async create(data: Prisma.Post2UncheckedCreateInput) {
    try {
      const createdPost = await this.prisma.post2.create({
        data,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      await this.redisService.invalidateByPrefix(TPost2ServiceCache.POST_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
      await this.redisService.invalidateByPrefix(TPost2ServiceCache.POST_PAGINATION_CACHE_PREFIX) // invalidate cache

      return createdPost
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
    orderBy: TGetPosts2PaginateOrderByFields | null = TGetPosts2PaginateFields.CREATED_AT,
    order: TPaginateOrderByValues = TPaginateOrderBy.ASC
  ) {
    const cacheKey = `${TPost2ServiceCache.POST_PAGINATION_CACHE_PREFIX}limit:${limit}:page:${page}:orderBy:${orderBy}:order:${order}`
    const cachedData = await this.redisService.getValue(cacheKey)
    if (cachedData) {
      // check cache
      console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
      return cachedData
    }

    const skip = (page - 1) * limit
    const options: Prisma.Post2FindManyArgs = {
      take: limit,
      skip,
      select: {
        id: true,
        body: true,
        image: true,
        createdAt: true,
        author: {
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

    const [posts, total] = await Promise.all([this.prisma.post2.findMany(options), this.prisma.post2.count()])
    const next = limit + skip < total
    const previous = page > 1

    const result = {
      limit: limit,
      page,
      total,
      next,
      previous,
      totalPages: Math.ceil(total / limit),
      posts
    }

    await this.redisService.setValue(cacheKey, result, this.redisExpiry)
    console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'Result data', result)

    return result
  }

  async findAllUsingQuery(query: TPaginationZodValDto) {
    const { limit: limit, page, orderBy, order } = query
    const cacheKey = `${TPost2ServiceCache.POST_QUERY_PAGINATION_CACHE_PREFIX}limit:${limit}:page:${page}:orderBy:${orderBy}:order:${order}`
    // check cache
    const cachedData = await this.redisService.getValue(cacheKey)
    if (cachedData) {
      console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
      return cachedData
    }

    const skip = (page - 1) * limit
    const options: Prisma.Post2FindManyArgs = {
      take: limit,
      skip,
      select: {
        id: true,
        body: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        [orderBy]: order
      }
    }

    const [posts, total] = await Promise.all([this.prisma.post2.findMany(options), this.prisma.post2.count()])
    const next = limit + skip < total
    const previous = page > 1

    const result = {
      limit,
      page,
      total,
      next,
      previous,
      totalPages: Math.ceil(total / limit),
      posts
    }

    await this.redisService.setValue(cacheKey, result, this.redisExpiry)
    console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'Result data', result)

    return result
  }

  async findOneByID(id: string) {
    const cacheKey = `${TUserServiceCache.USER_SINGLE_CACHE_PREFIX}:${id}`
    // check cache
    const cachedData = (await this.redisService.getValue(cacheKey)) as TCachedFindUserById
    if (cachedData) {
      console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
      return cachedData
    }

    const post = await this.prisma.post2.findUnique({
      where: { id },
      select: {
        id: true,
        body: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    if (!post) throw new NotFoundException(`Post with id ${id} not found.`)
    await this.redisService.setValue(cacheKey, post, this.redisExpiry)
    console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'Post data', post)
    return post
  }

  async update(id: string, data: Prisma.Post2UncheckedUpdateInput) {
    try {
      const postExists = await this.prisma.post2.count({ where: { id } })
      if (!postExists) throw new NotFoundException(`Post with id ${id} not found.`)

      const updatedPost = await this.prisma.post2.update({
        where: { id },
        data,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      await this.redisService.invalidateByPrefix(TPost2ServiceCache.POST_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
      await this.redisService.invalidateByPrefix(TPost2ServiceCache.POST_PAGINATION_CACHE_PREFIX) // invalidate cache

      return updatedPost
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error)
      }
      throw error
    }
  }

  async remove(id: string) {
    const postExists = await this.prisma.post2.count({ where: { id } })
    if (!postExists) throw new NotFoundException(`Post with id ${id} not found`)
    const deletedPost = await this.prisma.post2.delete({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    await this.redisService.invalidateByPrefix(TPost2ServiceCache.POST_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
    await this.redisService.invalidateByPrefix(TPost2ServiceCache.POST_PAGINATION_CACHE_PREFIX) // invalidate cache

    return deletedPost
  }
}
