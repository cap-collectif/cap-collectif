export type UpdateGroupFormProps = {
  title: string
  description: string | null | undefined
  users: Array<{ value: string; label: string }>
  file: File | null
}

export type CreateGroupFormProps = {
  groupName: string
  description: string | null | undefined
}

export type EmailInput = {
  email: string
  line: string
}

export type CsvEmails = {
  duplicates: EmailInput[]
  invalid: EmailInput[]
  uniqueAndValid: EmailInput[]
  notFoundEmails?: string[]
}
