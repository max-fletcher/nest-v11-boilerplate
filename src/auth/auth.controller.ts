import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { RegistrationSchema, type TRegistrationBodyDto } from './validators/user-registration.schema'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { LoginSchema, type TLoginBodyDto } from './validators/user-login.schema'
import { AuthService } from './auth.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { formattedResponse } from 'src/utils/formatters/responses.formatter'
import { RefreshJwtAuthGuard } from 'src/common/guards/refresh-token.guard'
import { CurrentUser, type TCurrentUserType } from 'src/common/decorators/current-user.decorator'
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { SwaggerGeneralErrorResponses } from 'src/common/decorators/swagger.decorator'
@ApiTags('Auth')
@ApiBearerAuth()
@SwaggerGeneralErrorResponses()
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(RegistrationSchema)) registrationBodyDto: TRegistrationZodValDto
    @Body() registrationBodyDto: TRegistrationBodyDto
  ) {
    const validatedData = await validateWithZod(RegistrationSchema(this.prisma), registrationBodyDto)

    const registerData = await this.authService.registration(validatedData)

    return formattedResponse(registerData)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(LoginSchema)) loginBodyDto: TLoginZodValDto
    @Body() loginBodyDto: TLoginBodyDto
  ) {
    const validatedData = await validateWithZod(LoginSchema, loginBodyDto)

    const loginData = await this.authService.login(validatedData)

    return formattedResponse(loginData)
  }

  // uses refresh guard — expects refresh token in Authorization header
  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refresh(@CurrentUser() user: TCurrentUserType) {
    const data = await this.authService.refresh(user)

    return formattedResponse(
      {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: user
      },
      200,
      'Tokens refreshed successfully.'
    )
  }

  // uses access guard — expects access token in Authorization header
  @UseGuards(AccessTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@CurrentUser() user: TCurrentUserType) {
    return formattedResponse(
      {
        user: await this.authService.logout(user.id)
      },
      200,
      'Logout Successful.'
    )
  }
}
