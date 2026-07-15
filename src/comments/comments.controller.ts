import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  DefaultValuePipe,
  Query,
  ParseIntPipe,
  BadRequestException,
  NotFoundException
} from '@nestjs/common'
import { CommentsService } from './comments.service'
import { TUpdateCommentUpdateDataDto, UpdateCommentSchema, type TUpdateCommentBodyDto } from './validators/update-comment.schema'
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard'
import { PrismaService } from 'src/prisma/prisma.service'
import { TRBACRoles } from 'src/enums/roles.enums'
import { TRBACActions, TRBACResources } from 'src/enums/permissions.enums'
import { RbacGuard } from 'src/common/guards/rbac.guard'
import { Roles } from 'src/common/decorators/RBAC/roles.decorator'
import { Permissions } from 'src/common/decorators/RBAC/permissions.decorator'
import { CreateCommentSchema, type TCreateCommentBodyDto } from './validators/create-comment.schema'
import { CurrentUser, type TCurrentUserType } from 'src/common/decorators/current-user.decorator'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { formattedResponse } from 'src/utils/formatters/responses.formatter'
import { type TPaginateOrderByValues } from 'src/types/paginate.types'
import { PAGINATE_ORDER_BY } from 'src/enums/pagination.enums'
import { GET_COMMENTS_PAGINATED_FIELDS } from './enums/pagination.enums'
import { type TGetCommentsPaginateOrderByFields } from './types/pagination.types'

@UseGuards(AccessTokenAuthGuard)
@Controller({ path: 'comments', version: '1' })
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly prisma: PrismaService
  ) {}

  @Roles(TRBACRoles.ADMIN, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.POST })
  @UseGuards(RbacGuard)
  @Post()
  async create(@Body() createCommentDto: TCreateCommentBodyDto, @CurrentUser() user: TCurrentUserType) {
    const validatedData = await validateWithZod(CreateCommentSchema(this.prisma), createCommentDto)
    const storeData = { userId: user.id, ...validatedData }

    return formattedResponse({
      comment: await this.commentsService.create(storeData)
    })
  }

  @Get()
  async findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('orderBy') orderBy: TGetCommentsPaginateOrderByFields,
    @Query('order') order: TPaginateOrderByValues
  ) {
    if (limit < 1) throw new BadRequestException('Limit cannot be less than 1.')
    if (page < 1) throw new BadRequestException('Page cannot be less than 1.')
    if (orderBy && !GET_COMMENTS_PAGINATED_FIELDS.includes(orderBy)) throw new BadRequestException('Invalid value provided for order by.')
    if (order.length === 0 || !PAGINATE_ORDER_BY.includes(order)) throw new BadRequestException('Invalid value provided for order.')

    return formattedResponse({
      paginatedComments: await this.commentsService.findAll(limit, page, orderBy, order)
    })
  }

  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.POST })
  @UseGuards(RbacGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return formattedResponse({
      post: await this.commentsService.findOneById(id)
    })
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: TCurrentUserType,
    // if you want a pipe validation, use this, but it cannot validate files. You will have to validate it separately.
    // @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: TUpdateUserZodValDto
    @Body() updateCommentBodyDto: TUpdateCommentBodyDto
  ) {
    const validatedData = await validateWithZod(UpdateCommentSchema, updateCommentBodyDto)
    const commentExists = await this.commentsService.findOneById(id)
    if (!commentExists) throw new NotFoundException('Comment not found.')

    const updateData: TUpdateCommentUpdateDataDto = { ...validatedData, userId: user.id }

    const updatedData = await this.commentsService.update(id, updateData)

    return formattedResponse({
      post: updatedData
    })
  }

  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.POST })
  @UseGuards(RbacGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: TCurrentUserType) {
    const deletedData = await this.commentsService.remove(id, user.id)

    return formattedResponse({
      comment: deletedData
    })
  }
}
