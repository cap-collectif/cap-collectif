import { UserInviteStatus } from '@relay/InviteUserMutation.graphql'
import { EmailInput } from '@shared/utils/csvUpload'

type Option = {
  label: string
  value: string
}

export type UserInviteFormProps = {
  role: { labels: Array<string> }
  groups: Option[]
  inputEmails: string
  csvEmails: CsvEmails
  customMessage: string
  redirectionUrl: string
  file: Blob | null | undefined
}

export type CsvEmails = {
  duplicateLines: EmailInput[]
  importedUsers: EmailInput[]
  invalidLines: EmailInput[]
}

export type UserInvite = {
  readonly id: string
  readonly email: string
  readonly isAdmin: boolean
  readonly isProjectAdmin: boolean
  readonly status: UserInviteStatus
  readonly groups: {
    readonly edges:
      | ReadonlyArray<
          | {
              readonly node: {
                readonly title: string | null | undefined
              }
            }
          | null
          | undefined
        >
      | null
      | undefined
  }
  readonly relaunchCount: number
}

export type EmailAvailabilities = {
  alreadyRegistered: string[]
  cannotBeInvited: string[]
}

export type Status = 'PENDING' | 'FAILED' | 'ALL' | 'EXPIRED' | 'ACCEPTED'

export type Invitation = {
  id: string
  email: string
  isAdmin: boolean
  isProjectAdmin: boolean
  status: Status
  relaunchCount: 0
  groups: {
    edges: Group[]
  }
  __typename: string
}

type Group = {
  node: {
    title: string
  }
}
