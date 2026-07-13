-- CreateTable
CREATE TABLE "Post2" (
    "id" TEXT NOT NULL,
    "body" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post2_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post2" ADD CONSTRAINT "Post2_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
