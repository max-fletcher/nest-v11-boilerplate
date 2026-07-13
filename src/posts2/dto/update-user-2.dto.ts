import { PartialType } from '@nestjs/mapped-types'
import { CreatePost2Dto } from './create-post-2.dto'

export class UpdateUserDto extends PartialType(CreatePost2Dto) {}
