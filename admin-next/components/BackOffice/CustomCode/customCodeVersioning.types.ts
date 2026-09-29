import { Control } from 'react-hook-form'
import { CustomCodeVersioningPageCommitMutation } from '@relay/CustomCodeVersioningPageCommitMutation.graphql'
import { CustomCodeVersioningPageDiffVersionQuery } from '@relay/CustomCodeVersioningPageDiffVersionQuery.graphql'
import { CustomCodeVersioningPageQuery } from '@relay/CustomCodeVersioningPageQuery.graphql'
import { CustomCodeVersioningPageVersionQuery } from '@relay/CustomCodeVersioningPageVersionQuery.graphql'
import { PreloadedQuery } from 'react-relay'

export type CustomCodeItem = NonNullable<
  CustomCodeVersioningPageQuery['response']['customCodeConfiguration'][number]
> & {
  value: string
  hasCode: boolean
  lineCount: number
  characterCount: number
  versions: Version[]
  hasMoreVersions: boolean
  versionsCount: number
}

export type Version = NonNullable<
  NonNullable<
    NonNullable<
      CustomCodeVersioningPageQuery['response']['customCodeConfiguration'][number]
    >['versionsConnection']['edges'][number]
  >['node']
>

export type CustomCodePayload = NonNullable<
  NonNullable<CustomCodeVersioningPageCommitMutation['response']['commitCustomCodeVersion']>['customCode']
>

export type CommitForm = {
  title: string
  authorName: string
  description?: string | null
  referenceUrl: string
}

export type CommitFormControl = Control<CommitForm>

export type VersionContentQueryReference = PreloadedQuery<CustomCodeVersioningPageVersionQuery>

export type VersionDiffQueryReference = PreloadedQuery<CustomCodeVersioningPageDiffVersionQuery>

export type ActiveCustomCodeModal =
  | { type: 'none' }
  | { type: 'commit' }
  | { type: 'restore'; version: Version }
  | { type: 'draftDiff' }
  | { type: 'fullscreenEditor' }
  | { type: 'versionContent'; version: Version }
  | { type: 'versionDiff'; version: Version; previousVersion: Version | null }
