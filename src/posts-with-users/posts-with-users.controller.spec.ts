import { Test, TestingModule } from '@nestjs/testing'
import { PostsWithUsersController } from './posts-with-users.controller'

describe('PostsWithUsersController', () => {
  let controller: PostsWithUsersController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsWithUsersController]
    }).compile()

    controller = module.get<PostsWithUsersController>(PostsWithUsersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
