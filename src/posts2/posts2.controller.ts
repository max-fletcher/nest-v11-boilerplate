import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard'
import { Posts2Service } from './posts2.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { formattedResponse } from 'src/utils/formatters/responses.formatter'
import { CurrentUser, type TCurrentUserType } from 'src/common/decorators/current-user.decorator'
import { type TGetPosts2PaginateOrderByFields } from './types/pagination.types'
import { type TPaginateOrderByValues } from 'src/types/paginate.types'
import { GET_POSTS_WITH_USER_PAGINATED_FIELDS } from './enums/pagination.enums'
import { PAGINATE_ORDER_BY } from 'src/enums/pagination.enums'
import { PaginationSchema, type TPaginationZodValDto } from 'src/common/validators/pagination.schema'
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipes'
import { TUpdatePost2UpdateDataDto, UpdatePost2Schema, type TUpdatePost2BodyDto } from './validators/update-post-2.schema'
import { CreatePost2Schema, type TCreatePost2BodyDto } from './validators/create-post-2.schema'
import { Roles } from 'src/common/decorators/RBAC/roles.decorator'
import { Permissions } from 'src/common/decorators/RBAC/permissions.decorator'
import { TRBACRoles } from 'src/enums/roles.enums'
import { TRBACActions, TRBACResources } from 'src/enums/permissions.enums'
import { RbacGuard } from 'src/common/guards/rbac.guard'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorageEngine } from 'src/common/multer/local-disk-storage.multer'
import { BaseUrl } from 'src/common/decorators/base-url.decorator'
import { deleteLocalFiles, localFilesFullPathResolver, singleFileExistsInResolver } from 'src/utils/local-file-storage/file.utils'

@UseGuards(AccessTokenAuthGuard)
@Controller({ path: 'posts2', version: '1' })
export class Posts2Controller {
  constructor(
    private readonly posts2Service: Posts2Service,
    private readonly prisma: PrismaService
  ) {}

  @Roles(TRBACRoles.ADMIN, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.CREATE, resource: TRBACResources.POST })
  @UseGuards(RbacGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], {
      storage: diskStorageEngine('files')
    })
  )
  @Post()
  async create(
    @BaseUrl() baseUrl: string,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(CreatePost2Schema)) createUserDto: TCreatePostZodValDto
    @Body() createPostBodyDto: TCreatePost2BodyDto
  ) {
    const validatedData = await validateWithZod(CreatePost2Schema(this.prisma), { ...createPostBodyDto, ...files })
    const filesWithFullPaths = localFilesFullPathResolver(baseUrl, files)
    const storeData = { ...validatedData, image: filesWithFullPaths?.image[0] }

    return formattedResponse({
      post: await this.posts2Service.create(storeData)
    })
  }

  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.POST })
  @UseGuards(RbacGuard)
  @Get()
  async findAll(
    @CurrentUser() user: TCurrentUserType,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('orderBy') orderBy: TGetPosts2PaginateOrderByFields,
    @Query('order') order: TPaginateOrderByValues
  ) {
    if (limit < 1) throw new BadRequestException('Limit cannot be less than 1.')
    if (page < 1) throw new BadRequestException('Page cannot be less than 1.')
    if (orderBy.length === 0 || !GET_POSTS_WITH_USER_PAGINATED_FIELDS.includes(orderBy)) throw new BadRequestException('Invalid value provided for order by.')
    if (order.length === 0 || !PAGINATE_ORDER_BY.includes(order)) throw new BadRequestException('Invalid value provided for order.')

    return formattedResponse({
      loggedInUser: user,
      paginatedPosts: await this.posts2Service.findAll(limit, page, orderBy, order)
    })
  }

  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.POST })
  @UseGuards(RbacGuard)
  @Get('query')
  async findAllUsingQuery(
    @CurrentUser() user: TCurrentUserType,
    // using generics to infer type "TPaginationZodValDto" or object query
    @Query(new ZodValidationPipe(PaginationSchema(GET_POSTS_WITH_USER_PAGINATED_FIELDS, GET_POSTS_WITH_USER_PAGINATED_FIELDS[0]))) query: TPaginationZodValDto
  ) {
    return formattedResponse({
      loggedInUser: user,
      paginatedPosts: await this.posts2Service.findAllUsingQuery(query)
    })
  }

  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.POST })
  @UseGuards(RbacGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return formattedResponse({
      post: await this.posts2Service.findOneByID(id)
    })
  }

  @Roles(TRBACRoles.ADMIN, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.UPDATE, resource: TRBACResources.POST })
  @UseGuards(RbacGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], {
      storage: diskStorageEngine('files')
    })
  )
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @BaseUrl() baseUrl: string,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: TUpdateUserZodValDto
    @Body() updatePostBodyDto: TUpdatePost2BodyDto
  ) {
    const validatedData = await validateWithZod(UpdatePost2Schema(this.prisma), { ...updatePostBodyDto, ...files })
    const postExists = await this.posts2Service.findOneByID(id)
    if (!postExists) throw new NotFoundException('Post not found.')

    const updateData: TUpdatePost2UpdateDataDto = { ...validatedData, image: postExists.image }

    const filesWithFullPaths = localFilesFullPathResolver(baseUrl, files)
    const filesToDelete: string[] = []
    if (singleFileExistsInResolver(filesWithFullPaths?.image)) {
      updateData.image = singleFileExistsInResolver(filesWithFullPaths?.image)
      if (postExists.image) filesToDelete.push(postExists.image)
    }

    const updatedData = await this.posts2Service.update(id, updateData)
    await deleteLocalFiles(baseUrl, filesToDelete)

    return formattedResponse({
      post: updatedData
    })
  }

  @Roles(TRBACRoles.ADMIN, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.DELETE, resource: TRBACResources.POST })
  @UseGuards(RbacGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const postExists = await this.posts2Service.findOneByID(id)
    if (!postExists) throw new NotFoundException('Post not found.')

    const deletedData = await this.posts2Service.remove(id)

    return formattedResponse({
      post: deletedData
    })
  }
}
