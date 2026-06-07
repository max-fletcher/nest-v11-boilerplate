import { Controller, Get } from '@nestjs/common'
import { SeederService } from './seeder.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { formattedResponse } from 'src/utils/formatters/responses.formatter'

@Controller('api/v1/seeder')
export class SeederController {
  constructor(
    private readonly seederService: SeederService,
    private readonly prisma: PrismaService
  ) {}

  @Get('/seed')
  async findAll() {
    return formattedResponse({
      message: await this.seederService.seed()
    })
  }
}
