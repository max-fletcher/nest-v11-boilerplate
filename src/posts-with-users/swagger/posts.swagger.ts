import { createAndUpdateUserProperties } from 'src/users/swagger/users.swagger'

const createAndUpdatePostProperties = {
  title: {
    type: 'string',
    example: 'Post title 1'
  },
  content: {
    type: 'string',
    example: 'Lorem ipsum dolor...'
  },
  published: {
    type: 'booelan',
    example: true
  },
  authorId: {
    type: 'string',
    example: 'cmpwgpxzy0002ccvhdim...'
  }
}

export const CreatePostBody = {
  schema: {
    type: 'object',
    required: ['title', 'authorId'],
    properties: createAndUpdatePostProperties
  }
}

export const CreatePostWithUserBody = {
  schema: {
    type: 'object',
    required: ['name', 'email', 'password', 'title', 'authorId'],
    properties: { ...createAndUpdateUserProperties, ...createAndUpdatePostProperties }
  }
}

export const UpdatePostBody = {
  schema: {
    type: 'object',
    properties: createAndUpdatePostProperties
  }
}

const SinglePostDataSchema = {
  type: 'object',
  properties: {
    post: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '89q3hderq3j09q2e...' },
        title: { type: 'string', example: 'Post title 1' },
        content: { type: 'string', nullable: true, example: 'Lorem ipsum dolor...' },
        published: {
          type: 'boolean',
          default: true,
          example: true
        },
        authorId: {
          type: 'string',
          example: '89q3hderq3j09q2e...'
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        author: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '89q3hderq3j09q2e...' },
            name: { type: 'string', example: 'John doe1' },
            email: { type: 'string', example: 'johndoe1@mail.com' }
          }
        }
      }
    }
  }
}

export const FindSinglePostResponse = {
  description: 'When single a user is fetched successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      status: { type: 'number', example: 200 },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'object',
            properties: {
              user: SinglePostDataSchema
            }
          }
        }
      }
    }
  }
}

export const PostCreatedResponse = {
  description: 'When post is created successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      status: { type: 'number', example: 201 },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' },
          data: SinglePostDataSchema
        }
      }
    }
  }
}

export const PostUpdatedResponse = {
  description: 'When a user is updated successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      status: { type: 'number', example: 201 },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' },
          data: SinglePostDataSchema
        }
      }
    }
  }
}

export const PostDeletedResponse = {
  description: 'When user is deleted successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      status: { type: 'number', example: 200 },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' },
          data: SinglePostDataSchema
        }
      }
    }
  }
}

export const GetPaginatedPostsListResponse = {
  description: `When user's list is fetched successfully`,
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      status: { type: 'number', example: 200 },
      response: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'object',
            properties: {
              loggedInUser: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '89q3hderq3j09q2e...' },
                  name: { type: 'string', example: 'John doe1' },
                  email: { type: 'string', example: 'johndoe1@mail.com' },
                  avatar: {
                    type: 'string',
                    nullable: true,
                    example: 'http://localhost:3000/uploads/files/1780489784748-bb3c64e8-41c7-4155-8720-047c34b4db77-sdfg4w.PNG'
                  },
                  background: {
                    type: 'string',
                    nullable: true,
                    example: 'http://localhost:3000/uploads/files/1780489784748-bb3c64e8-41c7-4155-8720-047c34b4db77-sdfg4w.PNG'
                  }
                }
              },
              paginatedPosts: {
                type: 'object',
                properties: {
                  limit: { type: 'number', example: 10, default: 1 },
                  page: { type: 'number', example: 1, default: 1 },
                  total: { type: 'number', example: 100 },
                  next: { type: 'boolean', example: true },
                  previous: { type: 'boolean', example: false },
                  totalpages: { type: 'number', example: 10 },
                  posts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '89q3hderq3j09q2e...' },
                        title: { type: 'string', example: 'Post title 1' },
                        content: { type: 'string', example: 'Lorem ipsum dolor...' },
                        published: { type: 'boolean', default: true, example: true },
                        authorId: { type: 'string', example: '89q3hderq3j09q2e...' },
                        author: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '89q3hderq3j09q2e...' },
                            name: { type: 'string', example: 'John Doe1' },
                            email: { type: 'string', example: 'johndoe1@mail.com' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
