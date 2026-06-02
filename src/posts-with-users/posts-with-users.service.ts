import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Post, Prisma, User } from 'generated/prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { handlePrismaError } from 'src/utils/prisma/prisma.utils'
import { type TPaginateOrderByValues } from 'src/types/paginate.types'
import { type TGetPostsWithUsersPaginateOrderByFields } from './types/pagination.types'
import { TGetPostsWithUserPaginateFields } from './enums/pagination.enums'
import { TPaginateOrderBy } from 'src/enums/pagination.enums'
import { TPaginationZodValDto } from 'src/common/validators/pagination.schema'
import { TCreatePostWithUserStoreDataDto } from './validators/create-post-with-user.schema'
import { TRBACRoles } from 'src/enums/roles.enums'
import { RedisService } from 'src/redis/redis.service'
import { TPostServiceCache } from 'src/permissions/enums/cache.enums'
import { TUserServiceCache } from 'src/users/enums/cache.enums'

type TCachedFindUserById = Omit<Post, 'authorId' | 'updatedAt'> & {
  author: Omit<User, 'password' | 'hashedRefreshToken' | 'avatar' | 'background' | 'createdAt' | 'updatedAt'>
}

@Injectable()
export class PostsWithUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService
  ) {}

  async create(data: Prisma.PostUncheckedCreateInput) {
    try {
      const createdPost = await this.prisma.post.create({
        data,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      await this.redisService.invalidateByPrefix(TPostServiceCache.POST_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
      await this.redisService.invalidateByPrefix(TPostServiceCache.POST_PAGINATION_CACHE_PREFIX) // invalidate cache

      return createdPost
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error)
      }
      throw error
    }
  }

  async findAll(
    take = 10,
    page = 1,
    orderBy: TGetPostsWithUsersPaginateOrderByFields | null = TGetPostsWithUserPaginateFields.CREATED_AT,
    order: TPaginateOrderByValues = TPaginateOrderBy.ASC
  ) {
    const cacheKey = `${TPostServiceCache.POST_PAGINATION_CACHE_PREFIX}limit:${take}:page:${page}:orderBy:${orderBy}:order:${order}`
    const cachedData = await this.redisService.getValue(cacheKey)
    if (cachedData) {
      // check cache
      console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
      return cachedData
    }

    const skip = (page - 1) * take
    const options: Prisma.PostFindManyArgs = {
      take,
      skip,
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }
    if (orderBy)
      options['orderBy'] = {
        [orderBy]: order
      }

    const [posts, total] = await Promise.all([this.prisma.post.findMany(options), this.prisma.post.count()])
    const next = take + skip < total
    const prev = page > 1

    const result = {
      limit: take,
      page,
      total,
      next,
      prev,
      totalPages: Math.ceil(total / take),
      posts
    }

    await this.redisService.setValue(cacheKey, result, 10)
    console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'Result data', result)

    return result
  }

  async findAllUsingQuery(query: TPaginationZodValDto) {
    const { limit: take, page, orderBy, order } = query
    const cacheKey = `${TPostServiceCache.POST_QUERY_PAGINATION_CACHE_PREFIX}limit:${take}:page:${page}:orderBy:${orderBy}:order:${order}`
    // check cache
    const cachedData = await this.redisService.getValue(cacheKey)
    if (cachedData) {
      console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
      return cachedData
    }

    const skip = (page - 1) * take
    const options: Prisma.PostFindManyArgs = {
      take,
      skip,
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        [orderBy]: order
      }
    }

    const [posts, total] = await Promise.all([this.prisma.post.findMany(options), this.prisma.post.count()])
    const next = take + skip < total
    const prev = page > 1

    const result = {
      take,
      page,
      total,
      next,
      prev,
      totalPages: Math.ceil(total / take),
      posts
    }

    await this.redisService.setValue(cacheKey, result, 10)
    console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'Result data', result)

    return result
  }

  async findOneByID(id: string) {
    const cacheKey = `${TPostServiceCache.POST_SINGLE_CACHE_PREFIX}:id`
    // check cache
    const cachedData = (await this.redisService.getValue(cacheKey)) as TCachedFindUserById
    if (cachedData) {
      console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
      return cachedData
    }

    const post = await this.prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    if (!post) throw new NotFoundException(`Post with id ${id} not found.`)
    await this.redisService.setValue(cacheKey, post, 10)
    console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'Post data', post)
    return post
  }

  async update(id: string, data: Prisma.PostUncheckedUpdateInput) {
    try {
      const postExists = await this.prisma.post.count({ where: { id } })
      if (!postExists) throw new NotFoundException(`Post with id ${id} not found.`)

      const updatedPost = await this.prisma.post.update({
        where: { id },
        data,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      await this.redisService.invalidateByPrefix(TPostServiceCache.POST_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
      await this.redisService.invalidateByPrefix(TPostServiceCache.POST_PAGINATION_CACHE_PREFIX) // invalidate cache

      return updatedPost
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error)
      }
      throw error
    }
  }

  async remove(id: string) {
    const postExists = await this.prisma.post.count({ where: { id } })
    if (!postExists) throw new NotFoundException(`Post with id ${id} not found`)
    const deletedPost = await this.prisma.post.delete({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    await this.redisService.invalidateByPrefix(TPostServiceCache.POST_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
    await this.redisService.invalidateByPrefix(TPostServiceCache.POST_PAGINATION_CACHE_PREFIX) // invalidate cache

    return deletedPost
  }

  async createPostWithUser(data: TCreatePostWithUserStoreDataDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // create user first
        const user = await tx.user.create({
          data: {
            name: data.name,
            email: data.email,
            password: data.password,
            avatar: data.avatar,
            background: data.background
          }
        })

        const userRole = await tx.role.findFirst({ where: { name: TRBACRoles.USER } })
        if (!userRole) throw new InternalServerErrorException('User role not found.')
        await tx.userRole.create({ data: { userId: user.id, roleId: userRole.id } })

        // Not using Promise.all because we need the created user's id and it will only be returned when the create user query
        // finished first.
        const post = await tx.post.create({
          data: {
            title: data.title,
            content: data.content,
            published: data.published,
            authorId: user.id
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        await this.redisService.invalidateByPrefix(TPostServiceCache.POST_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
        await this.redisService.invalidateByPrefix(TPostServiceCache.POST_PAGINATION_CACHE_PREFIX) // invalidate cache
        await this.redisService.invalidateByPrefix(TUserServiceCache.USER_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
        await this.redisService.invalidateByPrefix(TUserServiceCache.USER_PAGINATION_CACHE_PREFIX) // invalidate cache

        return { post }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error)
      }
      throw error
    }
  }
}
