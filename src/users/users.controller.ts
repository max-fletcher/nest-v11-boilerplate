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
import { Roles } from 'src/common/decorators/RBAC/roles.decorator'
import { Permissions } from 'src/common/decorators/RBAC/permissions.decorator'
import { RbacGuard } from 'src/common/guards/rbac.guard'
import { TRBACRoles } from 'src/enums/roles.enums'
import { TRBACActions, TRBACResources } from 'src/enums/permissions.enums'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger'
import {
  CreateUserBody,
  FindSingleUserResponse,
  GetPaginatedUsersListResponse,
  UpdateUserBody,
  UserCreatedResponse,
  UserDeletedResponse,
  UserUpdatedResponse,
  UserWithRoleResponse
} from './swagger/users.swagger'
import { CreateUserValidationFailedResponse, UpdateUserValidationFailedResponse } from 'src/users/swagger/validate-users.swagger'
import { SwaggerGeneralErrorResponses, SwaggerPaginationQueryParams } from 'src/common/decorators/swagger.decorator'
import { ConflictResponse } from 'src/common/swagger/general-errors.swagger'

@ApiTags('Users')
@ApiBearerAuth()
@SwaggerGeneralErrorResponses()
@UseGuards(AccessTokenAuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService
  ) {}

  @ApiOperation({ summary: 'Create a user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(CreateUserBody)
  @ApiCreatedResponse(UserCreatedResponse)
  @ApiConflictResponse(ConflictResponse)
  @ApiUnprocessableEntityResponse(CreateUserValidationFailedResponse)
  @Roles(TRBACRoles.ADMIN)
  @Permissions({ action: TRBACActions.CREATE, resource: TRBACResources.USER })
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

  @ApiOperation({ summary: 'Get a list of users' })
  @SwaggerPaginationQueryParams(GET_USERS_PAGINATED_FIELDS)
  @ApiOkResponse(GetPaginatedUsersListResponse)
  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.USER })
  // use this format if you want more than one permission
  // @Permissions({ action: TRBACActions.READ, resource: TRBACResources.USER }, { action: TRBACActions.UPDATE, resource: TRBACResources.USER })
  @UseGuards(RbacGuard)
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
      loggedInUser: user,
      paginatedUsers: await this.usersService.findAll(limit, page, orderBy, order)
    })
  }

  @ApiOperation({ summary: 'Get a list of users' })
  @SwaggerPaginationQueryParams(GET_USERS_PAGINATED_FIELDS)
  @ApiOkResponse(GetPaginatedUsersListResponse)
  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.USER })
  @Get('query')
  async findAllUsingQuery(
    @CurrentUser() user: TCurrentUserType,
    // using generics to infer type "TPaginationZodValDto" or object query
    @Query(new ZodValidationPipe(PaginationSchema(GET_USERS_PAGINATED_FIELDS, GET_USERS_PAGINATED_FIELDS[0]))) query: TPaginationZodValDto
  ) {
    return formattedResponse({
      loggedInUser: user,
      paginatedUsers: await this.usersService.findAllUsingQuery(query)
    })
  }

  @ApiOperation({ summary: `Get the current user's info with roles and permissions` })
  @ApiOkResponse(UserWithRoleResponse)
  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.USER })
  @Get('user-with-role')
  async findUserWithRoles(@CurrentUser() user: TCurrentUserType) {
    const userWithRoles = await this.usersService.findOneWithRoles(user.id)

    return formattedResponse({
      userWithRoles
    })
  }

  @ApiOperation({ summary: `Get a single user's info` })
  @ApiOkResponse(FindSingleUserResponse)
  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.USER })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return formattedResponse({
      user: await this.usersService.findOneByID(id)
    })
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(UpdateUserBody)
  @ApiOkResponse(UserUpdatedResponse)
  @ApiConflictResponse(ConflictResponse)
  @ApiUnprocessableEntityResponse(UpdateUserValidationFailedResponse)
  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR)
  @Permissions({ action: TRBACActions.UPDATE, resource: TRBACResources.USER })
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

  @ApiOperation({ summary: 'Delete a user' })
  @ApiOkResponse(UserDeletedResponse)
  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR)
  @Permissions({ action: TRBACActions.DELETE, resource: TRBACResources.USER })
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
