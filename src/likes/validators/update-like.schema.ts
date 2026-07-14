// import { PrismaService } from 'src/prisma/prisma.service'
// import { z } from 'zod'

// export const UpdatePostSchema = (prisma: PrismaService) =>
//   z
//     .object({
//       postId: z
//         .string({
//           error: () => 'Post id must be a string.'
//         })
//         .optional()
//     })
//     .superRefine(async (data, ctx) => {
//       if (data.postId) {
//         const existingPost = await prisma.post.findUnique({
//           where: { id: data.postId }
//         })
//         if (!existingPost) {
//           ctx.addIssue({
//             code: 'custom',
//             message: 'User not found.',
//             path: ['postId']
//           })
//         }
//       }
//     })

// export type TUpdatePostZodValDto = z.infer<ReturnType<typeof UpdatePostSchema>>
// export type TUpdatePostBodyDto = TUpdatePostZodValDto
