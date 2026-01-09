import { ProposalCreateModal_proposalForm$key } from '@relay/ProposalCreateModal_proposalForm.graphql'
import { Control } from 'react-hook-form'

/**
 * Response value for a question in the proposal form.
 * Different question types use different value formats:
 * - text/textarea/editor/radio/button/number/siret/rna/majority: string
 * - checkbox: string[] (array of choice IDs)
 * - ranking: string[] (ordered array of choice IDs)
 * - select: { value: string; label: string } (object with value and label)
 * - unanswered: null
 */
export type ResponseValue = {
  question: string
  value: string | string[] | { value: string; label: string } | null
}

export type FormValues = {
  title: string
  summary?: string
  body?: string
  theme?: string
  category?: string
  district?: string
  address?: string
  media?: { id: string; url: string } | null
  responses: ResponseValue[]
  webPageUrl?: string
  facebookUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  linkedInUrl?: string
}

export type ButtonChoice = {
  id: string
  label: string
  color?: string | null
}

export type ButtonChoicesProps = {
  name: string
  control: Control<any>
  choices: ButtonChoice[]
}

export type RankingChoice = {
  id: string
  label: string
}

export type RankingChoicesProps = {
  name: string
  control: Control<any>
  choices: RankingChoice[]
}

export type Props = {
  disabled: boolean
  proposalForm: ProposalCreateModal_proposalForm$key
}
