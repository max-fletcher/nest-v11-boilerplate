import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { TRegistrationBodyDto } from './validators/user-registration.schema'
import { Prisma } from 'generated/prisma/client'
import { handlePrismaError } from 'src/utils/prisma/prisma.utils'
import * as bcrypt from 'bcrypt'
import { TLoginBodyDto } from './validators/user-login.schema'
import { JwtService } from '@nestjs/jwt'
import { StringValue } from 'ms'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async registration(data: TRegistrationBodyDto) {
    try {
      const userExists = await this.prisma.user.findUnique({ where: { email: data.email } })
      if (userExists) throw new ForbiddenException('User with this email already exists.')

      const hashedPassword = await bcrypt.hash(data.password, 10)
      const createdUser = await this.prisma.user.create({ data: { ...data, password: hashedPassword } })

      const payload = {
        sub: createdUser.id, // sub is the standard JWT claim for the user id
        email: createdUser.email
      }
      const accessToken = this.generateToken(payload)
      return {
        jwt: accessToken,
        data: {
          user: {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            avatar: createdUser.avatar,
            backgroung: createdUser.background
          }
        }
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error)
      }
      throw error
    }
  }

  async login(data: TLoginBodyDto) {
    const user = await this.validateUser(data.email, data.password)

    const payload = {
      sub: user.id, // sub is the standard JWT claim for the user id
      email: user.email
    }
    const accessToken = this.generateToken(payload)

    return {
      jwt: accessToken,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          background: user.background
        }
      }
    }
  }

  async validateJWTUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException(`Invalid credentials.`)
    return user
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials')

    return user
  }

  async generateToken(payload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET as string,
      expiresIn: `${process.env.JWT_EXPIRY}m` as StringValue
    })

    return accessToken
  }
}
