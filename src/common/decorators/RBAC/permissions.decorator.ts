import { SetMetadata } from '@nestjs/common'

export type TPermission = {
  action: string
  resource: string
}

export const PERMISSIONS_KEY = 'permissions'
export const Permissions = (...permissions: TPermission[]) => SetMetadata(PERMISSIONS_KEY, permissions)
