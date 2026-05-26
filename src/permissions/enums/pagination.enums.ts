export enum TPermissionsPaginateFields {
  ACTION = 'action',
  RESOURCE = 'resource',
  CREATED_AT = 'createdAt'
}

export const GET_PERMISSIONS_PAGINATED_FIELDS = [TPermissionsPaginateFields.ACTION, TPermissionsPaginateFields.RESOURCE, TPermissionsPaginateFields.CREATED_AT] as const
