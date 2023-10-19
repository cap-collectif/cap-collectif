import type { LogicJumpConditionOperator } from '~relay/ReplyForm_questionnaire.graphql'
import type { MultipleChoiceQuestionValidationRulesTypes } from '~relay/responsesHelper_question.graphql'
import type { ReactSelectValue } from '~/components/Form/Select'
export type QuestionType =
  | 'button'
  | 'checkbox'
  | 'editor'
  | 'medias'
  | 'number'
  | 'majority'
  | 'radio'
  | 'ranking'
  | 'section'
  | 'select'
  | 'text'
  | 'textarea'
  | 'siret'
  | 'rna'
export type Media = {
  readonly id: string
  readonly name: string
  readonly url: string
  readonly size: string
}
export type Value = {
  labels: Array<string>
  other?: string | null
}
export type Field = {
  id: string
  label: string
  description?: string
  color?: string
  image?: {
    url: string
  }
  useIdAsValue?: boolean
}
export type Fields = {
  id: string
  type: string
  isOtherAllowed: boolean
  choices: Array<Field>
  checked: boolean
  helpText?: string
  description?: string
}
export type ConditionalJumpCondition = {
  readonly id: string
  readonly operator: LogicJumpConditionOperator
  readonly question: {
    readonly id: string
    readonly title: string
    readonly type: QuestionType
  }
  readonly value: {
    readonly id: string
    readonly title: string
  }
}
export type Jump = {
  readonly id: string
  readonly origin: {
    readonly id: string
  }
  readonly destination: {
    readonly id: string
    readonly title: string
    readonly number: number
  }
  readonly conditions: ReadonlyArray<ConditionalJumpCondition>
}
export type DestinationJump = {
  readonly id: string
  readonly origin: {
    readonly id: string
    readonly title: string
  }
}
export type QuestionChoice = {
  readonly id: string
  readonly title: string
  readonly description: string | null | undefined
  readonly color: string | null | undefined
  readonly image:
    | {
        readonly id: string
        readonly url: string
      }
    | null
    | undefined
}
// This is a cp/paster of
// responsesHelper_question without $refType
export type Question = {
  readonly __typename: string
  readonly hidden: boolean
  readonly id: string
  readonly title: string
  readonly number: number
  readonly private: boolean
  readonly level?: number | null | undefined
  readonly position: number
  readonly required: boolean
  readonly helpText: string | null | undefined
  readonly alwaysJumpDestinationQuestion:
    | {
        readonly id: string
        readonly title: string
        readonly number: number
      }
    | null
    | undefined
  readonly jumps: ReadonlyArray<Jump>
  readonly destinationJumps: ReadonlyArray<DestinationJump>
  readonly description: string | null | undefined
  readonly type: QuestionType
  readonly isOtherAllowed?: boolean
  readonly randomQuestionChoices?: boolean
  readonly validationRule?:
    | {
        readonly type: MultipleChoiceQuestionValidationRulesTypes
        readonly number: number
      }
    | null
    | undefined
  readonly choices?: {
    readonly pageInfo: {
      readonly hasNextPage: boolean
    }
    readonly totalCount: number
    readonly edges:
      | ReadonlyArray<
          | {
              readonly node: QuestionChoice | null | undefined
            }
          | null
          | undefined
        >
      | null
      | undefined
  }
  readonly isRangeBetween?: boolean
  readonly rangeMin?: number | null | undefined
  readonly rangeMax?: number | null | undefined
  readonly groupedResponsesEnabled?: boolean
  readonly responseColorsDisabled?: boolean
}
export type Questions = ReadonlyArray<Question>
export type ResponsesFromAPI = ReadonlyArray<
  | {
      readonly $fragmentRefs?: any
      readonly question: {
        readonly id: string
        readonly level?: number | null | undefined
        readonly title?: string
        readonly __typename?: string
      }
      readonly value?: string | null | undefined
      readonly medias?: ReadonlyArray<{
        readonly id: string
        readonly name: string
        readonly url: string
        readonly size: string
      }>
    }
  | null
  | undefined
>
export type MultipleChoiceQuestionValue = {
  labels: ReadonlyArray<string>
  other: string | null | undefined
}
export type ResponseInReduxForm = {
  question: string
  value:
    | MultipleChoiceQuestionValue
    | ReactSelectValue
    | (string | null | undefined)
    | (number | null | undefined)
    | ReadonlyArray<Media | string>
}
export type ResponsesInReduxForm = ReadonlyArray<ResponseInReduxForm>
// The real type is
//
// type SubmitResponses = $ReadOnlyArray<{|
//   value: string,
//   question: string,
// |} | {|
//   question: string,
//   medias: $ReadOnlyArray<string>,
// |}>;
export type SubmitResponses = ReadonlyArray<{
  value?: any
  question: string
  medias?: ReadonlyArray<string> | null | undefined
}>
export type ResponseError = {
  value: string
}
export type ResponseWarning =
  | {
      value: string
    }
  | null
  | undefined
export type ResponsesWarning = Array<ResponseWarning | null | undefined>
export type ResponsesError = Array<ResponseError | null | undefined>
export const OPERATOR: {
  IS: 'IS'
  IS_NOT: 'IS_NOT'
} = {
  IS: 'IS',
  IS_NOT: 'IS_NOT',
}
