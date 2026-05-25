import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from 'generated/prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { handlePrismaError } from 'src/utils/prisma/prisma.utils'
import { type TPaginateOrderByValues } from 'src/types/paginate.types'
import { type TGetPostsWithUsersPaginateOrderByFields } from './types/pagination.types'
import { TGetPostsWithUserPaginateFields } from './enums/pagination.enums'
import { TPaginateOrderBy } from 'src/enums/pagination.enums'
import { TPaginationZodValDto } from 'src/common/validators/pagination.schema'
import { TCreatePostWithUserStoreDataDto } from './validators/create-post-with-user.schema'

@Injectable()
export class PostsWithUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PostUncheckedCreateInput) {
    try {
      return await this.prisma.post.create({
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

    return {
      limit: take,
      page,
      total,
      next,
      prev,
      totalPages: Math.ceil(total / take),
      posts
    }
  }

  async findAllUsingQuery(query: TPaginationZodValDto) {
    const { limit: take, page, orderBy, order } = query
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

    return {
      take,
      page,
      total,
      next,
      prev,
      totalPages: Math.ceil(total / take),
      posts
    }
  }

  async findOneByID(id: string) {
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
    return post
  }

  async update(id: string, data: Prisma.PostUncheckedUpdateInput) {
    try {
      const postExists = await this.prisma.post.count({ where: { id } })
      if (!postExists) throw new NotFoundException(`Post with id ${id} not found.`)

      return await this.prisma.post.update({
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
    return this.prisma.post.delete({
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
