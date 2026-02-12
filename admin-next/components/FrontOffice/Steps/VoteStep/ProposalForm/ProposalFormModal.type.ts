import { Control } from 'react-hook-form'

export type CreateModeProps = {
  mode: 'create'
  disabled: boolean
  proposalForm: any
  stepId: string
  proposal?: never
  onClose?: never
  onButtonClick?: () => void
}

export type EditModeProps = {
  mode: 'edit'
  proposal: any
  proposalForm: any
  onClose: () => void
  disabled?: never
  stepId?: never
}

/**
 * Response value for a question in the proposal form.
 * Different question types use different value formats:
 * - text/textarea/editor/number/siret/rna/majority: string
 * - radio/button: string (choice ID)
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

export type ChoiceImage = {
  id: string
  url: string
} | null

export type ButtonChoice = {
  id: string
  label: string
  color?: string | null
  image?: ChoiceImage
}

export type ButtonChoicesProps = {
  name: string
  control: Control<any>
  choices: ButtonChoice[]
  groupedResponsesEnabled?: boolean
  responseColorsDisabled?: boolean
}

export type RankingChoice = {
  id: string
  label: string
  image?: ChoiceImage
}

export type RankingChoicesProps = {
  name: string
  control: Control<any>
  choices: RankingChoice[]
}

export type MultipleChoiceChoice = {
  id: string
  label: string
  description?: string | null
  image?: { id: string; url: string } | null
}

export type ValidationRule = {
  type: 'MIN' | 'MAX' | 'EQUAL'
  number: number
}

export type MultipleChoiceQuestionProps = {
  name: string
  // Using Control<any> because the field name is dynamic (e.g., "responses.0.value")
  // and TypeScript cannot infer the exact path at compile time
  control: Control<any>
  choices: MultipleChoiceChoice[]
  isOtherAllowed?: boolean
  isMultiple?: boolean
  validationRule?: ValidationRule | null
}

export type ParsedResponse = {
  value: any
  otherValue?: string | null
}
