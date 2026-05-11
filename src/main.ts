import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './all-exceptions.filter'
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common'
import { ValidationError } from 'class-validator'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  // Serve static files from the "uploads" directory at the "/uploads" URL path
  // *IMPORTANT NOTE: The starting directory is from /dist. That is why we are using join(__dirname, '..', '..', 'public', 'uploads') and not join(__dirname, '..', 'public', 'uploads')
  app.useStaticAssets(join(__dirname, '..', '..', 'public', 'uploads'), {
    prefix: '/uploads/'
  })

  // *IMPORTANT: (FOR CLASS VALIDATOR ONLY)
  // FUNCTION THAT IS AS A FACTORY(SEE BELOW INSIDE app.useGlobalPipes) TO STRUCTURE ERRORS IN A DESIRED FORM
  function extractNestedErrors(errors: ValidationError[]): Record<string, string[]> {
    const result = {}
    errors.forEach((error) => {
      if (error.constraints) {
        // result[error.property] = Object.values(error.constraints); // REPLACE LINE BELOW WITH THIS IS YOU WANT ALL VAL ERRORS AS ARRAY
        result[error.property] = Object.values(error.constraints)[0]
      } else if (error.children && error.children.length > 0) {
        // result[error.property] = extractNestedErrors(error.children); // REPLACE LINE BELOW WITH THIS IS YOU WANT ALL VAL ERRORS AS ARRAY
        result[error.property] = extractNestedErrors(error.children)[0]
      }
    })
    return result
  }

  // *IMPORTANT: (FOR CLASS VALIDATOR ONLY)
  // USING A CUSTOM VALIDATION PIPE GLOBALLY TO FORMAT ERRORS TO A DESIRED FORM
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true, // stop at first validation failure(order not guaranteed)
      exceptionFactory: (errors: ValidationError[]) => {
        // NOT IN USE HERE IF YOU ARE USING CUSTOM GLOBAL EXCEPTION HANDLER/FILTER(I.E AllExceptionsFilter). VALIDATION ERRORS ARE HANDLED THERE AND
        const formattedErrors = {}

        errors.forEach((error) => {
          if (error.constraints) {
            // formattedErrors[error.property] = Object.values(error.constraints) // REPLACE LINE BELOW WITH THIS IS YOU WANT ALL VAL ERRORS AS ARRAY
            formattedErrors[error.property] = Object.values(error.constraints)[0]
          } else if (error.children && error.children.length > 0) {
            // formattedErrors[error.property] = extractNestedErrors(error.children) // REPLACE LINE BELOW WITH THIS IS YOU WANT ALL VAL ERRORS AS ARRAY
            formattedErrors[error.property] = extractNestedErrors(error.children)[0]
          }
        })

        return new UnprocessableEntityException({
          message: 'Validation failed',
          errors: formattedErrors
        })
      }
    })
  )

  // IMPORTING AND APPLYING STUFF FOR THE CUSTOM ExceptionFilter WE CREATED(next 2 lines)
  const { httpAdapter } = app.get(HttpAdapterHost)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
