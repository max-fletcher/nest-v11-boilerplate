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
  UnprocessableEntityException,
  NotFoundException,
  UseGuards
} from '@nestjs/common'
import { UsersService } from './users.service'
import { type TCreateUserBodyDto, CreateUserSchema } from './validators/create-user.schema'
import { type TUpdateUserBodyDto, TUpdateUserUpdateDataDto, UpdateUserSchema } from './validators/update-user.schema'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorageEngine } from 'src/common/multer/local-disk-storage.multer'
import { validateWithZod } from 'src/utils/zod-validation/zod-validation.utils'
import { deleteLocalFiles, localFilesFullPathResolver, rollbackLocalFilesUpload, singleFileExistsInResolver } from 'src/utils/local-file-storage/file.utils'
import { BaseUrl } from 'src/common/decorators/base-url.decorator'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { type User } from 'generated/prisma/client'
import { formattedResponse } from 'src/utils/formatters/responses.formatter'

@UseGuards(JwtAuthGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 1 }
      ],
      {
        storage: diskStorageEngine('users')
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
      const validatedData = await validateWithZod(CreateUserSchema, { ...createUserBodyDto, ...files })
      const filesWithFullPaths = localFilesFullPathResolver(baseUrl, files)
      const storeData = { ...validatedData, avatar: filesWithFullPaths?.avatar[0], background: filesWithFullPaths?.background[0] }

      return formattedResponse({
        user: this.usersService.create(storeData)
      })
    } catch (error) {
      await rollbackLocalFilesUpload(files)
      if (error instanceof UnprocessableEntityException) {
        throw new UnprocessableEntityException(error)
      }
      throw error
    }
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return formattedResponse({
      logged_in_user: user,
      users: this.usersService.findAll()
    })
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return formattedResponse({
      user: this.usersService.findOneByID(id)
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
        storage: diskStorageEngine('users')
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

      const updatedData = this.usersService.update(id, updateData)
      await deleteLocalFiles(baseUrl, filesToDelete)

      return formattedResponse({
        user: updatedData
      })
    } catch (error) {
      await rollbackLocalFilesUpload(files)
      if (error instanceof UnprocessableEntityException) {
        throw new UnprocessableEntityException(error)
      }
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

    const deletedData = this.usersService.remove(id)
    await deleteLocalFiles(baseUrl, filesToDelete)

    return formattedResponse({
      user: deletedData
    })
  }
}
