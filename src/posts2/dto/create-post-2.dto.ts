import { IsDefined, IsString } from 'class-validator'
export class CreatePost2Dto {
  @IsDefined()
  @IsString()
  body!: string

  @IsDefined()
  @IsString()
  authorId!: string
}
