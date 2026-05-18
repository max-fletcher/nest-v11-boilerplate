import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { TRegistrationBodyDto } from './validators/user-registration.schema'
import { Prisma } from 'generated/prisma/client'
import { handlePrismaError } from 'src/utils/prisma/prisma.utils'
import * as bcrypt from 'bcrypt'
import { TLoginBodyDto } from './validators/user-login.schema'
import { JwtService } from '@nestjs/jwt'
import { StringValue } from 'ms'
import { PrismaService } from 'src/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { TCurrentUserType } from 'src/common/decorators/current-user.decorator'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
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
      const tokens = await this.generateTokens(payload)
      await this.storeRefreshToken(createdUser.id, tokens.refreshToken)
      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          avatar: createdUser.avatar,
          background: createdUser.background
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
    const tokens = await this.generateTokens(payload)
    await this.storeRefreshToken(user.id, tokens.refreshToken)
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        background: user.background
      }
    }
  }

  async validateAccessTokenUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException(`Invalid credentials.`)
    return user
  }

  // used in email and password matching in login
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials')

    return user
  }

  private async generateTokens(payload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: `${this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRY')}m`
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: `${this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRY')}m`
      })
    ])

    return { accessToken, refreshToken }
  }

  // hashes and stores refresh token in DB
  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken }
    })
  }

  // ✅ validates refresh token against hashed version in DB
  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token.')
    }

    const tokenMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken)
    if (!tokenMatches) throw new UnauthorizedException('Invalid refresh token.')

    return user
  }

  // issues new tokens and rotates refresh token
  async refresh(user: TCurrentUserType) {
    const payload = {
      sub: user.id, // sub is the standard JWT claim for the user id
      email: user.email
    }
    const tokens = await this.generateTokens(payload)
    await this.storeRefreshToken(user.id, tokens.refreshToken) // rotate refresh token
    return tokens
  }

  // clears refresh token on logout
  async logout(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null }, // invalidates the refresh token
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    return user
  }
}
