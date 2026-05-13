import { IsBoolean, IsDefined, IsString, Length } from 'class-validator'
export class CreatePostDto {
  @IsDefined()
  @IsString()
  @Length(3, 300)
  title!: string

  @IsDefined()
  @IsString()
  content!: string

  @IsDefined()
  @IsBoolean()
  published!: string

  @IsDefined()
  @IsString()
  authorId!: string
}
