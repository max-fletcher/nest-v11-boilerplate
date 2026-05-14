import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException
} from '@nestjs/common'
import { UsersService } from './users.service'
import { type TCreateUserBodyDto, CreateUserSchema } from './validators/create-user.schema'
import { type TUpdateUserBodyDto, TUpdateUserUpdateDataDto, UpdateUserSchema } from './validators/update-user.schema'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorageEngine } from 'src/common/multer/local-disk-storage.multer'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { deleteLocalFiles, localFilesFullPathResolver, rollbackLocalFilesUpload, singleFileExistsInResolver } from 'src/utils/local-file-storage/file.utils'
import { BaseUrl } from 'src/common/decorators/base-url.decorator'
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard'
import { CurrentUser, type TCurrentUserType } from 'src/common/decorators/current-user.decorator'
import { formattedResponse } from 'src/utils/formatters/responses.formatter'
import { type TPaginateOrderByValues } from 'src/types/paginate.types'
import { type TGetUsersPaginateOrderByFields } from './types/pagination.types'
import { PrismaService } from 'src/prisma/prisma.service'
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipes'
import { PaginationSchema, type TPaginationZodValDto } from 'src/common/validators/pagination.schema'
import { GET_USERS_PAGINATED_FIELDS } from './enums/pagination.enums'
import { PAGINATE_ORDER_BY } from 'src/enums/pagination.enums'

@UseGuards(AccessTokenAuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 1 }
      ],
      {
        storage: diskStorageEngine('files')
      }
    )
  )
  async create(
    @BaseUrl() baseUrl: string,
    @UploadedFiles() files: { avatar?: Express.Multer.File[]; background?: Express.Multer.File[] },
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: TCreateUserZodValDto
    @Body() createUserBodyDto: TCreateUserBodyDto
  ) {
    try {
      const validatedData = await validateWithZod(CreateUserSchema(this.prisma), { ...createUserBodyDto, ...files })
      const filesWithFullPaths = localFilesFullPathResolver(baseUrl, files)
      const storeData = { ...validatedData, avatar: filesWithFullPaths?.avatar[0], background: filesWithFullPaths?.background[0] }

      return formattedResponse({
        user: await this.usersService.create(storeData)
      })
    } catch (error) {
      await rollbackLocalFilesUpload(files)
      throw error
    }
  }

  @Get()
  async findAll(
    @CurrentUser() user: TCurrentUserType,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('orderBy') orderBy: TGetUsersPaginateOrderByFields,
    @Query('order') order: TPaginateOrderByValues
  ) {
    if (limit < 1) throw new BadRequestException('Limit cannot be less than 1.')
    if (page < 1) throw new BadRequestException('Page cannot be less than 1.')
    if (orderBy.length === 0 || !GET_USERS_PAGINATED_FIELDS.includes(orderBy)) throw new BadRequestException('Invalid value provided for order by.')
    if (order.length === 0 || !PAGINATE_ORDER_BY.includes(order)) throw new BadRequestException('Invalid value provided for order.')

    return formattedResponse({
      logged_in_user: user,
      users: await this.usersService.findAll(limit, page, orderBy, order)
    })
  }

  @Get('query')
  async findAllUsingQuery(
    @CurrentUser() user: TCurrentUserType,
    // using generics to infer type "TPaginationZodValDto" or object query
    @Query(new ZodValidationPipe(PaginationSchema(GET_USERS_PAGINATED_FIELDS, GET_USERS_PAGINATED_FIELDS[0]))) query: TPaginationZodValDto
  ) {
    return formattedResponse({
      logged_in_user: user,
      users: await this.usersService.findAllUsingQuery(query)
    })
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return formattedResponse({
      user: await this.usersService.findOneByID(id)
    })
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 1 }
      ],
      {
        storage: diskStorageEngine('files')
      }
    )
  )
  async update(
    @Param('id') id: string,
    @BaseUrl() baseUrl: string,
    @UploadedFiles() files: { avatar?: Express.Multer.File[]; background?: Express.Multer.File[] },
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: TUpdateUserZodValDto
    @Body() updateUserBodyDto: TUpdateUserBodyDto
  ) {
    try {
      const validatedData = await validateWithZod(UpdateUserSchema, { ...updateUserBodyDto, ...files })
      const userExists = await this.usersService.findOneByID(id)
      if (!userExists) throw new NotFoundException('User not found.')

      const updateData: TUpdateUserUpdateDataDto = {
        ...validatedData,
        avatar: userExists.avatar,
        background: userExists.background
      }

      const filesWithFullPaths = localFilesFullPathResolver(baseUrl, files)
      const filesToDelete: string[] = []
      if (singleFileExistsInResolver(filesWithFullPaths?.avatar)) {
        updateData.avatar = singleFileExistsInResolver(filesWithFullPaths?.avatar)
        if (userExists.avatar) filesToDelete.push(userExists.avatar)
      }
      if (singleFileExistsInResolver(filesWithFullPaths?.background)) {
        updateData.background = singleFileExistsInResolver(filesWithFullPaths?.background)
        if (userExists.background) filesToDelete.push(userExists.background)
      }

      const updatedData = await this.usersService.update(id, updateData)
      await deleteLocalFiles(baseUrl, filesToDelete)

      return formattedResponse({
        user: updatedData
      })
    } catch (error) {
      await rollbackLocalFilesUpload(files)
      throw error
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @BaseUrl() baseUrl: string) {
    const userExists = await this.usersService.findOneByID(id)
    if (!userExists) throw new NotFoundException('User not found.')

    const filesToDelete: string[] = []
    if (userExists.avatar) {
      if (userExists.avatar) filesToDelete.push(userExists.avatar)
    }
    if (userExists.background) {
      if (userExists.background) filesToDelete.push(userExists.background)
    }

    const deletedData = await this.usersService.remove(id)
    await deleteLocalFiles(baseUrl, filesToDelete)

    return formattedResponse({
      user: deletedData
    })
  }
}
