import { IntlShape } from 'react-intl'
import { ProjectConfigForm_project$data } from '@relay/ProjectConfigForm_project.graphql'
import { MultipleRadioValue } from '@cap-collectif/form'
import moment from 'moment'

export type Option = {
  value: string
  label: string
}

export type FormValues = {
  title: string
  description: string | null
  cover?: {
    id: string
    name: string
    size: string
    url: string
  } | null
  publishedAt: Object
  locale: {
    label: string
    value: string
  } | null
  archived: boolean
  authors: Option[] | []
  projectType: string | null
  themes: Option[] | []
  metaDescription: string | null
  isProposalStepSplitViewEnabled: boolean
  video: string | null
  districts: Option[] | []
  address?: string | null
  visibility: MultipleRadioValue
  restrictedViewerGroups: Array<{ label: string; value: string }>
  opinionCanBeFollowed: boolean
  isExternal: boolean
  externalLink: string | null
  externalParticipantsCount: number | null
  externalContributionsCount: number | null
  externalVotesCount: number | null
  addressText?: string | null
  steps: Array<{ id: string; label: string, __typename: string }>
  customCode?: string | null
}

export const getInitialValues = (project: ProjectConfigForm_project$data, intl: IntlShape): FormValues => ({
  title: project?.title || intl.formatMessage({ id: 'new-project' }),
  description: project?.description || '',
  archived: project?.archived,
  authors:
    project && project.authors
      ? project.authors.map(a => ({ value: a?.value ?? '', label: a?.label ?? '' })) || []
      : [],
  projectType: project && project.type ? project.type.id : null,
  visibility: {
    labels: project ? [project.visibility] : ['ADMIN'],
  },
  publishedAt: project ? moment(project.publishedAt) : '',
  themes: project && project.themes ? project.themes.map(theme => theme) || [] : [],
  isProposalStepSplitViewEnabled: project ? project.isProposalStepSplitViewEnabled : false,
  video: project ? project.video : null,
  cover: project ? project.cover : null,
  opinionCanBeFollowed: project ? project.opinionCanBeFollowed : false,
  isExternal: project ? project.isExternal : false,
  externalLink: project ? project.externalLink : null,
  externalContributionsCount: project ? project.externalContributionsCount : null,
  externalParticipantsCount: project ? project.externalParticipantsCount : null,
  externalVotesCount: project ? project.externalVotesCount : null,
  metaDescription: project ? project.metaDescription : null,
  addressText: project ? project.address?.formatted : null,
  address: project && project?.address?.json ? JSON.parse(project.address.json)[0] : null,
  districts:
    project?.districts?.edges?.map(edge => edge?.node)?.map(d => ({ value: d?.value ?? '', label: d?.label ?? '' })) ||
    [],
  restrictedViewerGroups:
    project?.restrictedViewers?.edges
      ?.map(edge => edge?.node)
      .map(d => ({ value: d?.value ?? '', label: d?.label ?? '' })) || [],
  locale:
    project && project.locale
      ? {
          value: project.locale.value,
          label: intl.formatMessage({ id: project.locale.label }),
        }
      : null,
  steps: project?.steps ? project.steps.map(s => ({ ...s })) : [],
  customCode: project ? project.customCode : null,
})
