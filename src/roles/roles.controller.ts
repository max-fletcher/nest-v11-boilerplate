import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard'
import { RolesService } from './roles.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { TRBACRoles } from 'src/enums/roles.enums'
import { Roles } from 'src/common/decorators/RBAC/roles.decorator'
import { Permissions } from 'src/common/decorators/RBAC/permissions.decorator'
import { TRBACActions, TRBACResources } from 'src/enums/permissions.enums'
import { RbacGuard } from 'src/common/guards/rbac.guard'
import { AssignRolesToUserSchema, type TAssignRolesToUserBodyDto } from './validators/assign-roles-to-user.schema'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { formattedResponse } from 'src/utils/formatters/responses.formatter'
@UseGuards(AccessTokenAuthGuard)
@Controller('api/v1/roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly prisma: PrismaService
  ) {}

  @Roles(TRBACRoles.ADMIN)
  @Permissions({ action: TRBACActions.UPDATE, resource: TRBACResources.ROLES })
  @UseGuards(RbacGuard)
  @HttpCode(HttpStatus.OK)
  @Post('assign-role-to-user')
  async create(@Body() assignRolesToUserBodyDto: TAssignRolesToUserBodyDto) {
    const validatedData = await validateWithZod(AssignRolesToUserSchema(this.prisma), assignRolesToUserBodyDto)

    const data = await this.rolesService.assignRolesToUser(validatedData)

    return formattedResponse({
      user_with_role: data
    })
  }

  @Roles(TRBACRoles.ADMIN)
  @Permissions({ action: TRBACActions.READ, resource: TRBACResources.ROLES })
  @UseGuards(RbacGuard)
  @Get(':id')
  async get(@Param('id') id: string) {
    const data = await this.rolesService.get(id)

    return formattedResponse({
      role_with_permission: data
    })
  }
}
