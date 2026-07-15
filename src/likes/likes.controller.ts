import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, DefaultValuePipe, ParseIntPipe, BadRequestException } from '@nestjs/common'
import { LikesService } from './likes.service'
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard'
import { PrismaService } from 'src/prisma/prisma.service'
import { Roles } from 'src/common/decorators/RBAC/roles.decorator'
import { TRBACRoles } from 'src/enums/roles.enums'
import { TRBACActions, TRBACResources } from 'src/enums/permissions.enums'
import { Permissions } from 'src/common/decorators/RBAC/permissions.decorator'
import { RbacGuard } from 'src/common/guards/rbac.guard'
import { CreateLikeSchema, type TCreateLikeBodyDto } from './validators/create-like.schema'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { formattedResponse } from 'src/utils/formatters/responses.formatter'
import { type TGetLikesPaginateOrderByFields } from './types/pagination.types'
import { type TPaginateOrderByValues } from 'src/types/paginate.types'
import { GET_LIKES_PAGINATED_FIELDS } from './enums/pagination.enums'
import { PAGINATE_ORDER_BY } from 'src/enums/pagination.enums'
import { CurrentUser, type TCurrentUserType } from 'src/common/decorators/current-user.decorator'

@UseGuards(AccessTokenAuthGuard)
@Controller({ path: 'likes', version: '1' })
export class LikesController {
  constructor(
    private readonly likesService: LikesService,
    private readonly prisma: PrismaService
  ) {}

  @Roles(TRBACRoles.ADMIN, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.POST })
  @UseGuards(RbacGuard)
  @Post()
  async createOrRemove(@Body() createLikeDto: TCreateLikeBodyDto, @CurrentUser() user: TCurrentUserType) {
    const validatedData = await validateWithZod(CreateLikeSchema(this.prisma), createLikeDto)
    const storeData = { userId: user.id, ...validatedData }

    return formattedResponse({
      like: await this.likesService.createOrRemove(storeData)
    })
  }

  @Get()
  async findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('orderBy') orderBy: TGetLikesPaginateOrderByFields,
    @Query('order') order: TPaginateOrderByValues
  ) {
    if (limit < 1) throw new BadRequestException('Limit cannot be less than 1.')
    if (page < 1) throw new BadRequestException('Page cannot be less than 1.')
    if (orderBy && !GET_LIKES_PAGINATED_FIELDS.includes(orderBy)) throw new BadRequestException('Invalid value provided for order by.')
    if (order.length === 0 || !PAGINATE_ORDER_BY.includes(order)) throw new BadRequestException('Invalid value provided for order.')

    return formattedResponse({
      paginatedLikes: await this.likesService.findAll(limit, page, orderBy, order)
    })
  }

  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.POST })
  @UseGuards(RbacGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return formattedResponse({
      like: await this.likesService.findOneById(id)
    })
  }

  @Roles(TRBACRoles.ADMIN, TRBACRoles.MODERATOR, TRBACRoles.USER)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.POST })
  @UseGuards(RbacGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: TCurrentUserType) {
    const deletedData = await this.likesService.remove(id, user.id)

    return formattedResponse({
      like: deletedData
    })
  }
}
