import { Test, TestingModule } from '@nestjs/testing'
import { PostsWithUsersService } from './posts-with-users.service'

describe('PostsWithUsersService', () => {
  let service: PostsWithUsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsWithUsersService]
    }).compile()

    service = module.get<PostsWithUsersService>(PostsWithUsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
