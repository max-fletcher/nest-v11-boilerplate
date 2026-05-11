import { Body, Controller, Post, UnprocessableEntityException } from '@nestjs/common'
import { RegistrationSchema, type TRegistrationBodyDto } from './validators/user-registration.schema'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { LoginSchema, type TLoginBodyDto } from './validators/user-login.schema'
import { AuthService } from './auth.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { formattedResponse } from 'src/utils/formatters/responses.formatter'

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) {}

  @Post('register')
  async register(
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(RegistrationSchema)) registrationBodyDto: TRegistrationZodValDto
    @Body() registrationBodyDto: TRegistrationBodyDto
  ) {
    try {
      const validatedData = await validateWithZod(RegistrationSchema(this.prisma), registrationBodyDto)

      const registerData = await this.authService.registration(validatedData)

      return formattedResponse(registerData)
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        throw new UnprocessableEntityException(error)
      }
      throw error
    }
  }

  @Post('login')
  async login(
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(LoginSchema)) loginBodyDto: TLoginZodValDto
    @Body() loginBodyDto: TLoginBodyDto
  ) {
    try {
      const validatedData = await validateWithZod(LoginSchema, loginBodyDto)

      const loginData = await this.authService.login(validatedData)

      return formattedResponse(loginData)
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        throw new UnprocessableEntityException(error)
      }
      throw error
    }
  }
}
