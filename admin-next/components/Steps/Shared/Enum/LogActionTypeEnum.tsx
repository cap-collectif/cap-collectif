type LogActionTypeUnion = 'CREATE' | 'EDIT'

export const LogActionTypeEnum: Record<LogActionTypeUnion, LogActionTypeUnion> = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
} as const
