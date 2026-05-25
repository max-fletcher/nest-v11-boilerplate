import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from 'generated/prisma/client'
import { handlePrismaError } from 'src/utils/prisma/prisma.utils'
import { TGetUsersPaginateOrderByFields } from './types/pagination.types'
import { TPaginateOrderByValues } from 'src/types/paginate.types'
import { TGetUsersPaginateFields } from './enums/pagination.enums'
import { TPaginateOrderBy } from 'src/enums/pagination.enums'
import { TPaginationZodValDto } from 'src/common/validators/pagination.schema'
import * as bcrypt from 'bcrypt'
import { TRBACRoles } from 'src/enums/roles.enums'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        const createdUser = await tx.user.create({ data: { ...data, password: hashedPassword } })

        const userRole = await tx.role.findFirst({ where: { name: TRBACRoles.USER } })
        if (!userRole) throw new InternalServerErrorException('User role not found.')
        await tx.userRole.create({ data: { userId: createdUser.id, roleId: userRole.id } })

        return createdUser
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
    orderBy: TGetUsersPaginateOrderByFields | null = TGetUsersPaginateFields.CREATED_AT,
    order: TPaginateOrderByValues = TPaginateOrderBy.ASC
  ) {
    const skip = (page - 1) * take
    const options: Prisma.UserFindManyArgs = {
      take,
      skip,
      select: { id: true, email: true, name: true, createdAt: true }
    }
    if (orderBy)
      options['orderBy'] = {
        [orderBy]: order
      }

    const [users, total] = await Promise.all([this.prisma.user.findMany(options), this.prisma.user.count()])
    const next = take + skip < total
    const prev = page > 1

    return {
      limit: take,
      page,
      total,
      next,
      prev,
      totalPages: Math.ceil(total / take),
      users
    }
  }

  async findAllUsingQuery(query: TPaginationZodValDto) {
    const { limit: take, page, orderBy, order } = query
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

    return {
      take,
      page,
      total,
      next,
      prev,
      totalPages: Math.ceil(total / take),
      users
    }
  }

  async findOneByID(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException(`User with id ${id} not found.`)
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

      return await this.prisma.user.update({ where: { id }, data })
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
    return this.prisma.user.delete({ where: { id } })
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
}
