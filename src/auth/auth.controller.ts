import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { RegistrationSchema, type TRegistrationBodyDto } from './validators/user-registration.schema'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { LoginSchema, type TLoginBodyDto } from './validators/user-login.schema'
import { AuthService } from './auth.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { formattedResponse } from 'src/utils/formatters/responses.formatter'
import { RefreshJwtAuthGuard } from 'src/common/guards/refresh-token.guard'
import { CurrentUser, type TCurrentUserType } from 'src/common/decorators/current-user.decorator'
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard'
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger'
import { SwaggerGeneralErrorResponses } from 'src/common/decorators/swagger.decorator'
import { AuthSuccessfulResponse, LogoutSuccessfulResponse, UserLoginPropertiesBody, UserRegisterPropertiesBody } from './swagger/auth.swagger'
import { ConflictResponse } from 'src/common/swagger/general-errors.swagger'
import { LoginValidationFailedResponse, RegistrationValidationFailedResponse } from './swagger/validate-auth.swagger'
@ApiTags('Auth')
@SwaggerGeneralErrorResponses()
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) {}

  @ApiOperation({ summary: `Used to register to the application` })
  @ApiConsumes('multipart/form-data')
  @ApiBody(UserRegisterPropertiesBody)
  @ApiOkResponse(AuthSuccessfulResponse)
  @ApiConflictResponse(ConflictResponse)
  @ApiUnprocessableEntityResponse(RegistrationValidationFailedResponse)
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

  @ApiOperation({ summary: `Used to login to the application` })
  @ApiConsumes('multipart/form-data')
  @ApiBody(UserLoginPropertiesBody)
  @ApiOkResponse(AuthSuccessfulResponse)
  @ApiConflictResponse(ConflictResponse)
  @ApiUnprocessableEntityResponse(LoginValidationFailedResponse)
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
  @ApiOperation({ summary: `Used to refresh access token using a user's valid refresh token` })
  @ApiBearerAuth()
  @ApiOkResponse(AuthSuccessfulResponse)
  @UseGuards(RefreshJwtAuthGuard)
  @Get('refresh')
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
  @ApiOperation({ summary: `Used to logout from the application` })
  @ApiBearerAuth()
  @ApiOkResponse(LogoutSuccessfulResponse)
  @UseGuards(AccessTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('logout')
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
