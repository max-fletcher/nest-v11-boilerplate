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
import { PostsWithUsersService } from './posts-with-users.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreatePostSchema, type TCreatePostBodyDto } from './validators/create-post.schema'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { formattedResponse } from 'src/utils/formatters/responses.formatter'
import { CurrentUser, type TCurrentUserType } from 'src/common/decorators/current-user.decorator'
import { type TGetPostsWithUsersPaginateOrderByFields } from './types/pagination.types'
import { type TPaginateOrderByValues } from 'src/types/paginate.types'
import { GET_POSTS_WITH_USER_PAGINATED_FIELDS } from './enums/pagination.enums'
import { PAGINATE_ORDER_BY } from 'src/enums/pagination.enums'
import { PaginationSchema, type TPaginationZodValDto } from 'src/common/validators/pagination.schema'
import { ZodValidationPipe } from 'src/common/pipes/zod-validate.pipes'
import { UpdatePostSchema, type TUpdatePostBodyDto } from './validators/update-post.schema'
import { CreatePostWithUserSchema, TCreatePostWithUserStoreDataDto, type TCreatePostWithUserBodyDto } from './validators/create-post-with-user.schema'
import { localFilesFullPathResolver } from 'src/utils/local-file-storage/file.utils'
import { BaseUrl } from 'src/common/decorators/base-url.decorator'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorageEngine } from 'src/common/multer/local-disk-storage.multer'

@UseGuards(AccessTokenAuthGuard)
@Controller('api/v1/posts-with-users')
export class PostsWithUsersController {
  constructor(
    private readonly postsWithUsersService: PostsWithUsersService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  async create(
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(CreatePostSchema)) createUserDto: TCreatePostZodValDto
    @Body() createPostBodyDto: TCreatePostBodyDto
  ) {
    const validatedData = await validateWithZod(CreatePostSchema(this.prisma), createPostBodyDto)

    return formattedResponse({
      post: await this.postsWithUsersService.create(validatedData)
    })
  }

  @Get()
  async findAll(
    @CurrentUser() user: TCurrentUserType,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('orderBy') orderBy: TGetPostsWithUsersPaginateOrderByFields,
    @Query('order') order: TPaginateOrderByValues
  ) {
    if (limit < 1) throw new BadRequestException('Limit cannot be less than 1.')
    if (page < 1) throw new BadRequestException('Page cannot be less than 1.')
    if (orderBy.length === 0 || !GET_POSTS_WITH_USER_PAGINATED_FIELDS.includes(orderBy)) throw new BadRequestException('Invalid value provided for order by.')
    if (order.length === 0 || !PAGINATE_ORDER_BY.includes(order)) throw new BadRequestException('Invalid value provided for order.')

    return formattedResponse({
      logged_in_user: user,
      posts: await this.postsWithUsersService.findAll(limit, page, orderBy, order)
    })
  }

  @Get('query')
  async findAllUsingQuery(
    @CurrentUser() user: TCurrentUserType,
    // using generics to infer type "TPaginationZodValDto" or object query
    @Query(new ZodValidationPipe(PaginationSchema(GET_POSTS_WITH_USER_PAGINATED_FIELDS, GET_POSTS_WITH_USER_PAGINATED_FIELDS[0]))) query: TPaginationZodValDto
  ) {
    return formattedResponse({
      logged_in_user: user,
      posts: await this.postsWithUsersService.findAllUsingQuery(query)
    })
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return formattedResponse({
      post: await this.postsWithUsersService.findOneByID(id)
    })
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: TUpdateUserZodValDto
    @Body() updatePostBodyDto: TUpdatePostBodyDto
  ) {
    const validatedData = await validateWithZod(UpdatePostSchema(this.prisma), updatePostBodyDto)
    const postExists = await this.postsWithUsersService.findOneByID(id)
    if (!postExists) throw new NotFoundException('Post not found.')

    const updatedData = await this.postsWithUsersService.update(id, validatedData)

    return formattedResponse({
      post: updatedData
    })
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const postExists = await this.postsWithUsersService.findOneByID(id)
    if (!postExists) throw new NotFoundException('Post not found.')

    const deletedData = await this.postsWithUsersService.remove(id)

    return formattedResponse({
      post: deletedData
    })
  }

  @Post('create-post-with-user')
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
  async createPostWithUser(
    @BaseUrl() baseUrl: string,
    @UploadedFiles() files: { avatar?: Express.Multer.File[]; background?: Express.Multer.File[] },
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(CreatePostSchema)) createUserDto: TCreatePostZodValDto
    @Body() createPostWithUserBodyDto: TCreatePostWithUserBodyDto
  ) {
    const validatedData = await validateWithZod(CreatePostWithUserSchema(this.prisma), { ...createPostWithUserBodyDto, ...files })
    const filesWithFullPaths = localFilesFullPathResolver(baseUrl, files)
    const storeData = { ...validatedData, avatar: filesWithFullPaths?.avatar[0], background: filesWithFullPaths?.background[0] } as TCreatePostWithUserStoreDataDto

    const postWithUser = await this.postsWithUsersService.createPostWithUser(storeData)

    return formattedResponse({
      postWithUser
    })
  }
}
