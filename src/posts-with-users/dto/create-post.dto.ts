import { IsDefined, IsString } from 'class-validator'
export class CreatePostDto {
  @IsDefined()
  @IsString()
  postId!: string

  @IsDefined()
  @IsString()
  userId!: string
}
