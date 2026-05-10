import { Body, Controller, Post, UnprocessableEntityException } from '@nestjs/common'
import { RegistrationSchema, type TRegistrationBodyDto } from './validators/user-registration.schema'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { LoginSchema, type TLoginBodyDto } from './validators/user-login.schema'
import { AuthService } from './auth.service'

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: TCreateUserZodValDto
    @Body() registrationBodyDto: TRegistrationBodyDto
  ) {
    try {
      const validatedData = await validateWithZod(RegistrationSchema, registrationBodyDto)

      const registerData = await this.authService.registration(validatedData)

      return registerData
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
    // @Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: TCreateUserZodValDto
    @Body() loginBodyDto: TLoginBodyDto
  ) {
    try {
      const validatedData = await validateWithZod(LoginSchema, loginBodyDto)

      const loginData = await this.authService.login(validatedData)

      return loginData
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        throw new UnprocessableEntityException(error)
      }
      throw error
    }
  }
}
