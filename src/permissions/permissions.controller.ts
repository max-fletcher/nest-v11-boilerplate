import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { PermissionsService } from './permissions.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { Roles } from 'src/common/decorators/RBAC/roles.decorator'
import { TRBACActions, TRBACResources } from 'src/enums/permissions.enums'
import { RbacGuard } from 'src/common/guards/rbac.guard'
import { Permissions } from 'src/common/decorators/RBAC/permissions.decorator'
import { TRBACRoles } from 'src/enums/roles.enums'
import { AssignPermissionToRoleSchema, type TAssignPermissionToRoleBodyDto } from './validators/assign-permission-to-role.schema'
import { formattedResponse } from 'src/utils/formatters/responses.formatter'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { AccessTokenAuthGuard } from 'src/common/guards/access-token.guard'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger'
import { SwaggerGeneralErrorResponses } from 'src/common/decorators/swagger.decorator'
import { AssignPermissionsToRoleBody, AssignPermissionsToRoleResponse } from './swagger/permissions.swagger'
import { AssignPermissionsToRoleValidationFailedResponse } from './swagger/validate-permissions.swagger'

@ApiTags('Permissions')
@ApiBearerAuth()
@SwaggerGeneralErrorResponses()
@UseGuards(AccessTokenAuthGuard)
@Controller('api/v1/permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly prisma: PrismaService
  ) {}

  @ApiOperation({ summary: 'Assign permissions to and from a role' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(AssignPermissionsToRoleBody)
  @ApiOkResponse(AssignPermissionsToRoleResponse)
  @ApiUnprocessableEntityResponse(AssignPermissionsToRoleValidationFailedResponse)
  @Roles(TRBACRoles.ADMIN)
  @Permissions({ action: TRBACActions.UPDATE, resource: TRBACResources.ROLES })
  @UseGuards(RbacGuard)
  @HttpCode(HttpStatus.OK)
  @Post('assign-permissions-to-role')
  @Roles(TRBACRoles.ADMIN)
  @Permissions({ action: TRBACActions.UPDATE, resource: TRBACResources.PERMISSIONS })
  @UseGuards(RbacGuard)
  async create(@Body() assignPermissionToRoleBodyDto: TAssignPermissionToRoleBodyDto) {
    const validatedData = await validateWithZod(AssignPermissionToRoleSchema(this.prisma), assignPermissionToRoleBodyDto)

    const data = await this.permissionsService.assignPermissionToRole(validatedData)

    return formattedResponse({
      roleWithPermissions: data
    })
  }
}
