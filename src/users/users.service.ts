import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from 'generated/prisma/client'
import { handlePrismaError } from 'src/utils/prisma/prisma.utils'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    try {
      return await this.prisma.user.create({ data })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error)
      }
      throw error
    }
  }

  findAll() {
    return this.prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } })
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
}
