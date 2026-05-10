import { relative, resolve } from 'path'
import { promises as fsPromises } from 'fs'
import * as path from 'path'

type MulterFiles = Record<string, Express.Multer.File[]>

export const localFilesFullPathResolver = (baseUrl: string, files: MulterFiles) => {
  if (!files || !Object.keys(files).length) return

  const formatted_paths: Record<string, string[]> = {}

  Object.entries(files).forEach(([fieldName, fileArray]) => {
    const paths = fileArray.map((file) => {
      const publicDirPath = resolve('public') // Absolute path to /public
      const filePath = resolve(file.path) // Absolute path to uploaded file
      const relativePath = relative(publicDirPath, filePath).replace(/\\/g, '/') // Always forward slashes
      baseUrl = process.env.FILE_BASE_URL && process.env.FILE_BASE_URL !== '' ? process.env.FILE_BASE_URL : baseUrl
      return `${baseUrl}/${relativePath}`
    })

    formatted_paths[fieldName] = paths
  })

  return formatted_paths
}

export const singleFileExistsInResolver = (fileArray: string[] | undefined) => {
  if (!fileArray || fileArray.length === 0) return null

  if (fileArray.length < 0) return null

  return fileArray[0]
}

export const rollbackLocalFilesUpload = async (files: MulterFiles): Promise<void> => {
  if (!files || !Object.keys(files).length) return

  const deletePromises = Object.values(files)
    .flat() // flatten array i.e convert [[field1, field2], [field3]] into [field1, field2, field3]
    .map(async (field) => {
      const filePath = path.normalize(field.path) // ✅ handles both Windows and Linux
      try {
        await fsPromises.unlink(filePath)
      } catch {
        console.log('rollbackLocalFilesUpload: Local file uploads rollback failed for:', filePath)
      }
    })

  await Promise.all(deletePromises)
}

export const deleteLocalFiles = async (baseUrl: string, filePaths: string[] | null): Promise<void> => {
  if (!filePaths || filePaths.length === 0) return

  const deletePromises = filePaths.map(async (filePath) => {
    const relativePath = filePath.replace(`${baseUrl}/`, '')
    const tempFilePath = path.normalize(path.join('public', relativePath))

    try {
      await fsPromises.unlink(tempFilePath)
    } catch {
      console.log('deleteLocalFile: Local file deletion failed for:', tempFilePath)
    }
  })

  await Promise.all(deletePromises)
}
