import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma, User } from 'generated/prisma/client'
import { handlePrismaError } from 'src/utils/prisma/prisma.utils'
import { TGetUsersPaginateOrderByFields } from './types/pagination.types'
import { TPaginateOrderByValues } from 'src/types/paginate.types'
import { TGetUsersPaginateFields } from './enums/pagination.enums'
import { TPaginateOrderBy } from 'src/enums/pagination.enums'
import { TPaginationZodValDto } from 'src/common/validators/pagination.schema'
import * as bcrypt from 'bcrypt'
import { TRBACRoles } from 'src/enums/roles.enums'
import { datetimeYMDHis } from 'src/utils/datetime/format-datetime.utils'
import { RedisService } from 'src/redis/redis.service'
import { TUserServiceCache } from './enums/cache.enums'

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService
  ) {}

  async create(data: Prisma.UserCreateInput) {
    try {
      const createdUser = await this.prisma.$transaction(async (tx) => {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        const createUser = await tx.user.create({ data: { ...data, password: hashedPassword } })

        const userRole = await tx.role.findFirst({ where: { name: TRBACRoles.USER } })
        if (!userRole) throw new InternalServerErrorException('User role not found.')
        await tx.userRole.create({ data: { userId: createUser.id, roleId: userRole.id } })

        return createUser
      })

      await this.redisService.invalidateByPrefix(TUserServiceCache.USER_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
      await this.redisService.invalidateByPrefix(TUserServiceCache.USER_PAGINATION_CACHE_PREFIX) // invalidate cache

      return createdUser
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
    orderBy: TGetUsersPaginateOrderByFields | null = TGetUsersPaginateFields.CREATED_AT,
    order: TPaginateOrderByValues = TPaginateOrderBy.ASC
  ) {
    const cacheKey = `${TUserServiceCache.USER_PAGINATION_CACHE_PREFIX}limit:${take}:page:${page}:orderBy:${orderBy}:order:${order}`
    // check cache
    const cachedData = await this.redisService.getValue(cacheKey)
    if (cachedData) {
      console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
      return cachedData
    }

    const skip = (page - 1) * take
    const options: Prisma.UserFindManyArgs = {
      take,
      skip,
      select: { id: true, email: true, name: true, createdAt: true }
    }
    if (orderBy) options['orderBy'] = { [orderBy]: order }

    const [users, total] = await Promise.all([this.prisma.user.findMany(options), this.prisma.user.count()])
    const next = take + skip < total
    const prev = page > 1

    const result = {
      limit: take,
      page,
      total,
      next,
      prev,
      totalPages: Math.ceil(total / take),
      users
    }

    await this.redisService.setValue(cacheKey, result, 10)
    console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'Result data', result)

    return result
  }

  async findAllUsingQuery(query: TPaginationZodValDto) {
    const { limit: take, page, orderBy, order } = query
    const cacheKey = `${TUserServiceCache.USER_QUERY_PAGINATION_CACHE_PREFIX}limit:${take}:page:${page}:orderBy:${orderBy}:order:${order}`
    const cachedData = await this.redisService.getValue(cacheKey)
    if (cachedData) {
      console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
      return cachedData
    }

    const skip = (page - 1) * take
    const options: Prisma.UserFindManyArgs = {
      take,
      skip,
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: {
        [orderBy]: order
      }
    }

    const [users, total] = await Promise.all([this.prisma.user.findMany(options), this.prisma.user.count()])
    const next = take + skip < total
    const prev = page > 1

    const result = {
      take,
      page,
      total,
      next,
      prev,
      totalPages: Math.ceil(total / take),
      users
    }

    await this.redisService.setValue(cacheKey, result, 10)
    console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'Result data', result)

    return result
  }

  async findOneByID(id: string) {
    const cacheKey = `${TUserServiceCache.USER_SINGLE_CACHE_PREFIX}:id`
    // check cache
    const cachedData = (await this.redisService.getValue(cacheKey)) as User
    if (cachedData) {
      console.log('Cache hit -> \n', 'Cache key:', cacheKey, '\n', 'Cache data', cachedData)
      return cachedData
    }

    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException(`User with id ${id} not found.`)

    await this.redisService.setValue(cacheKey, user, 10)
    console.log('Cache miss -> \n', 'Cache key:', cacheKey, '\n', 'User data', user)
    return user
  }

  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new NotFoundException(`User with email ${email} not found.`)
    return user
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    try {
      const userExists = await this.prisma.user.count({ where: { id } })
      if (!userExists) throw new NotFoundException(`User with id ${id} not found.`)

      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password as string, 10)
        data = { ...data, password: hashedPassword }
      }
      const updatedUser = await this.prisma.user.update({ where: { id }, data })

      await this.redisService.invalidateByPrefix(TUserServiceCache.USER_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
      await this.redisService.invalidateByPrefix(TUserServiceCache.USER_PAGINATION_CACHE_PREFIX) // invalidate cache

      return updatedUser
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error)
      }
      throw error
    }
  }

  async remove(id: string) {
    const userExists = await this.prisma.user.count({ where: { id } })
    if (!userExists) throw new NotFoundException(`User with id ${id} not found`)
    const deletedUser = this.prisma.user.delete({ where: { id } })

    await this.redisService.invalidateByPrefix(TUserServiceCache.USER_QUERY_PAGINATION_CACHE_PREFIX) // invalidate cache
    await this.redisService.invalidateByPrefix(TUserServiceCache.USER_PAGINATION_CACHE_PREFIX) // invalidate cache

    return deletedUser
  }

  async findOneWithRoles(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    })
  }

  dummy() {
    const currentDatetime = datetimeYMDHis(new Date())
    console.log('Cron job ran: ' + currentDatetime)
    return null
  }
}
