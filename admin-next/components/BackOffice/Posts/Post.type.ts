import { Option } from '@components/BackOffice/Projects/ProjectConfig/ProjectConfigForm.utils'
import { TranslationLocale } from '@relay/PostFormWrapperQuery.graphql'

export type RelatedContent = {
  __typename: string
  id: string
  title: string
}

export type PostFormValues = {
  title?: string | null | undefined
  abstract?: string | null | undefined
  body?: string | null | undefined
  authors: Array<Option> | [] | null | undefined
  media?: { id: string; url: string } | null | undefined
  publishedAt?: string | null | undefined
  commentable?: boolean | null | undefined
  isPublished?: boolean | null | undefined
  displayedOnBlog?: boolean | null | undefined
  translations?: Translation[] | [] | null
  languages?: Locale[] | null | undefined
  metaDescription?: string | null | undefined
  customCode?: string | null | undefined
  proposals?: Array<Option> | [] | null | undefined
  projects?: Array<Option> | [] | null | undefined
  themes?: Array<Option> | [] | null | undefined
  owner?: Option | null
}

type Translation = {
  locale: string | null
  title: string | null
  body: string | null
  abstract: string | null
  metaDescription: string | null
}

export type Organization = {
  displayName: string
  id: string
}

export type Locale = {
  code: TranslationLocale
  id: string
  isDefault: boolean
  traductionKey: string
}

export type ProjectsList = Array<{
  node: {
    id: string
    title: string
  }
}>
