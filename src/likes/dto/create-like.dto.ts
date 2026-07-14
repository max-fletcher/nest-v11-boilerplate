import { IsDefined, IsString } from 'class-validator'

export class CreateLikeDto {
  @IsDefined()
  @IsString()
  postId!: string
}
