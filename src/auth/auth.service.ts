import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { TRegistrationBodyDto } from './validators/user-registration.schema'
import { Prisma } from 'generated/prisma/client'
import { handlePrismaError } from 'src/utils/prisma/prisma.utils'
import * as bcrypt from 'bcrypt'
import { TLoginBodyDto } from './validators/user-login.schema'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { TCurrentUserType } from 'src/common/decorators/current-user.decorator'
import { TRBACRoles } from 'src/enums/roles.enums'

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

      return await this.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({ data: { ...data, password: hashedPassword } })

        const userRole = await tx.role.findFirst({ where: { name: TRBACRoles.USER } })
        if (!userRole) throw new InternalServerErrorException('User role not found.')
        await tx.userRole.create({ data: { userId: createdUser.id, roleId: userRole.id } })

        const payload = {
          sub: createdUser.id, // sub is the standard JWT claim for the user id
          email: createdUser.email
        }

        const tokens = await this.generateTokens(payload)
        await this.storeRefreshToken(createdUser.id, tokens.refreshToken, tx)

        const userWithRolesAndPermissions = await tx.user.findUnique({
          where: { id: createdUser.id },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            }
          }
        })

        const rolesAndPermissions = userWithRolesAndPermissions?.userRoles.map((userRole) =>
          userRole.role.rolePermissions.map((rolePermission) => `${rolePermission.permission.resource}:${rolePermission.permission.action}`)
        )

        return {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          user: {
            id: createdUser.id,
            firstName: createdUser.firstName,
            email: createdUser.email,
            avatar: createdUser.avatar,
            background: createdUser.background
          },
          rolesAndPermissions
        }
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error)
      }
      throw error
    }
  }

  async login(data: TLoginBodyDto) {
    const user = await this.validateUser(data.email, data.password)
    const rolesAndPermissions = user?.userRoles.map((userRole) =>
      userRole.role.rolePermissions.map((rolePermission) => `${rolePermission.permission.resource}:${rolePermission.permission.action}`)
    )

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
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        background: user.background
      },
      permissions: rolesAndPermissions
    }
  }

  async validateAccessTokenUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException(`Invalid credentials.`)
    return user
  }

  // used in email and password matching in login
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    })
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
  private async storeRefreshToken(userId: string, refreshToken: string, tx?: Prisma.TransactionClient) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

    if (tx) {
      return await tx.user.update({
        where: { id: userId },
        data: { hashedRefreshToken }
      })
    } else {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { hashedRefreshToken }
      })
    }
  }

  // validates refresh token against hashed version in DB
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
        firstName: true,
        lastName: true
      }
    })

    return user
  }
}
