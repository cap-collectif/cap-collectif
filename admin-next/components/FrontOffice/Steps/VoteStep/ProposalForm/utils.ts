import { ProposalFormModal_proposalForm$data } from '@relay/ProposalFormModal_proposalForm.graphql'
import { IntlShape } from 'react-intl'
import * as yup from 'yup'
import { ParsedResponse, ResponseValue, ValidationRule } from './ProposalFormModal.type'

export type Question = ProposalFormModal_proposalForm$data['questions'][number]

/**
 * Type guard to check if a response value is a select field response (object with value/label)
 */
const isSelectResponse = (value: ResponseValue['value']): value is { value: string; label: string } => {
  return typeof value === 'object' && value !== null && 'value' in value && !Array.isArray(value)
}

export const requiredMessageId = 'fill-field'

/**
 * Get the number of selected responses for a checkbox question, including "other" if selected.
 */
export const getResponseCount = (value: string[] | null | undefined, otherValue: string | null | undefined): number => {
  if (!Array.isArray(value) || value.length === 0) {
    return otherValue ? 1 : 0
  }
  const hasOtherInValue = value.includes('other')
  const choicesCount = value.filter(v => v !== 'other').length
  const otherCount = hasOtherInValue && otherValue ? 1 : 0
  return choicesCount + otherCount
}

const VALIDATION_RULES: Record<
  ValidationRule['type'],
  {
    check: (responseCount: number, targetNumber: number) => boolean
    messageId: string
  }
> = {
  MIN: {
    check: (count, num) => count >= num,
    messageId: 'reply.constraints.choices_min',
  },
  MAX: {
    check: (count, num) => count <= num,
    messageId: 'reply.constraints.choices_max',
  },
  EQUAL: {
    check: (count, num) => count === num,
    messageId: 'reply.constraints.choices_equal',
  },
}

/**
 * Check if a response count satisfies a validation rule (MIN, MAX, EQUAL).
 * @returns true if valid, false otherwise.
 */
export const isValidAgainstRule = (
  responseCount: number,
  validationRule: { type: ValidationRule['type']; number: number },
): boolean => {
  return VALIDATION_RULES[validationRule.type].check(responseCount, validationRule.number)
}

/**
 * Validate checkbox questions with validation rules (MIN, MAX, EQUAL).
 * Returns an array of errors with field names and messages.
 */
export const validateCheckboxRules = (
  questions: readonly Question[],
  responses: Array<{ question: string; value: any; 'value-other-value'?: string }>,
  availableQuestionIds: Set<string>,
  intl: IntlShape,
): Array<{ fieldName: string; message: string }> => {
  const errors: Array<{ fieldName: string; message: string }> = []

  responses.forEach((response, index) => {
    const question = questions.find((q: Question) => q.id === response.question)
    if (!question || question.type !== 'checkbox') return
    if (!availableQuestionIds.has(question.id)) return

    // Get validationRule from the question (only exists on MultipleChoiceQuestion)
    const validationRule = 'validationRule' in question ? (question as any).validationRule : null
    if (!validationRule) return

    const value = response.value as string[] | null
    const otherValue = response['value-other-value'] as string | undefined

    const responseCount = getResponseCount(value, otherValue)

    // Only validate if there's at least one response
    if (responseCount === 0) return

    if (!isValidAgainstRule(responseCount, validationRule)) {
      const errorMessage = intl.formatMessage(
        { id: getValidationMessageId(validationRule.type) },
        { nb: validationRule.number },
      )
      errors.push({ fieldName: `responses.${index}.value`, message: errorMessage })
    }
  })

  return errors
}

/**
 * Get the validation message ID for a validation rule type.
 */
export const getValidationMessageId = (type: ValidationRule['type']): string => {
  return VALIDATION_RULES[type].messageId
}

export const getChoiceLabelById = (question: any, choiceId: string): string | null => {
  if (choiceId === 'other') return null // "other" is handled separately
  const choice = question.choices?.edges?.find((edge: any) => edge?.node?.id === choiceId)
  return choice?.node?.title || null
}

export const getChoiceIdByLabel = (question: any, label: string): string | null => {
  const choice = question.choices?.edges?.find((edge: any) => edge?.node?.title === label)
  return choice?.node?.id || null
}

export const parseResponseValue = (response: any, question: any): ParsedResponse => {
  if (!response) return { value: null }

  if (response.medias) {
    return { value: response.medias.map((m: any) => ({ id: m.id, name: m.name, url: m.url })) }
  }

  if (response.value !== undefined) {
    const questionType = question?.type

    // Try to parse JSON for choice-based questions
    if (typeof response.value === 'string') {
      try {
        const parsed = JSON.parse(response.value)

        // Handle { labels: [...], other: ... } format for radio/checkbox/button/ranking
        if (parsed && typeof parsed === 'object' && 'labels' in parsed) {
          const { labels, other } = parsed

          if (questionType === 'radio' || questionType === 'button') {
            // Single choice - return the choice ID or 'other'
            if (labels && labels.length > 0) {
              const choiceId = getChoiceIdByLabel(question, labels[0])
              return { value: choiceId || labels[0], otherValue: other }
            }
            if (other) {
              return { value: 'other', otherValue: other }
            }
            return { value: null }
          }

          if (questionType === 'checkbox') {
            // Multiple choices - return array of choice IDs
            const choiceIds = (labels || [])
              .map((label: string) => getChoiceIdByLabel(question, label) || label)
              .filter(Boolean)
            if (other) {
              choiceIds.push('other')
            }
            return { value: choiceIds.length > 0 ? choiceIds : null, otherValue: other }
          }

          if (questionType === 'ranking') {
            // Ranking - return ordered array of choice IDs
            return {
              value: (labels || [])
                .map((label: string) => getChoiceIdByLabel(question, label) || label)
                .filter(Boolean),
            }
          }
        }

        // Fallback for array values
        if (Array.isArray(parsed)) {
          return { value: parsed }
        }
      } catch {
        // Not JSON
      }

      // For select questions, convert label to ID
      if (questionType === 'select') {
        const choiceId = getChoiceIdByLabel(question, response.value)
        return { value: choiceId || response.value }
      }
    }

    return { value: response.value }
  }

  return { value: null }
}

export const createProposalSchema = (proposalForm: ProposalFormModal_proposalForm$data, intl: IntlShape) => {
  const requiredMessage = intl.formatMessage({ id: requiredMessageId })
  const invalidUrlMessage = intl.formatMessage({ id: 'global.invalid-url' })

  // Helper to validate URLs - empty string is valid, non-empty must be valid URL
  const urlSchema = yup
    .string()
    .transform(val => (val ? val.trim() : val))
    .test('is-valid-url', invalidUrlMessage, value => {
      if (!value || value === '') return true
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    })

  return yup.object().shape({
    title: yup.string().required(requiredMessage),
    summary: yup.string(),

    body:
      proposalForm.usingDescription && proposalForm.descriptionMandatory
        ? yup.string().required(requiredMessage)
        : yup.string(),

    theme:
      proposalForm.usingThemes && proposalForm.themeMandatory ? yup.string().required(requiredMessage) : yup.string(),

    category:
      proposalForm.usingCategories && proposalForm.categoryMandatory
        ? yup.string().required(requiredMessage)
        : yup.string(),

    district:
      proposalForm.usingDistrict && proposalForm.districtMandatory
        ? yup.string().required(requiredMessage)
        : yup.string(),

    address: proposalForm.usingAddress ? yup.string().required(requiredMessage) : yup.string(),

    media: yup
      .object()
      .shape({
        id: yup.string().required(),
        url: yup.string().required(),
      })
      .nullable(),

    // Question responses - dynamic based on questions in proposalForm
    // Questions support logic jumps (conditional visibility based on other responses)
    // Individual question validation (required flag) should be handled at the form level
    responses: yup
      .array()
      .of(
        yup.object().shape({
          question: yup.string().required(), // Question ID
          value: yup.mixed().nullable(), // Accepts various formats: string, string[], object, null
          medias: yup.array().of(yup.string()), // For medias question type - array of media IDs
        }),
      )
      .test('checkbox-validation-rules', '', function (responses) {
        if (!responses) return true

        const errors: yup.ValidationError[] = []

        responses.forEach((response, index) => {
          const question = proposalForm.questions.find((q: Question) => q.id === response.question)
          if (!question || question.type !== 'checkbox') return

          // Get validationRule from the question (only exists on MultipleChoiceQuestion)
          const validationRule = 'validationRule' in question ? (question as any).validationRule : null
          if (!validationRule) return

          const value = response.value as string[] | null
          // The "other" value is stored on the response object at 'value-other-value'
          // because react-hook-form interprets the field name 'responses.${idx}.value-other-value'
          // as a nested path: responses[idx]['value-other-value']
          const otherValue = (response as any)?.['value-other-value'] as string | undefined

          const responseCount = getResponseCount(value, otherValue)

          // Only validate if there's at least one response
          if (responseCount === 0) return

          if (!isValidAgainstRule(responseCount, validationRule)) {
            const errorMessage = intl.formatMessage(
              { id: getValidationMessageId(validationRule.type) },
              { nb: validationRule.number },
            )
            // Path is relative to the field being tested (responses array)
            // So we use `${index}.value` not `responses.${index}.value`
            errors.push(new yup.ValidationError(errorMessage, response.value, `${index}.value`, 'checkbox-validation'))
          }
        })

        if (errors.length > 0) {
          throw new yup.ValidationError(errors)
        }

        return true
      })
      .test('number-range-validation', '', function (responses) {
        if (!responses) return true

        const errors: yup.ValidationError[] = []

        responses.forEach((response, index) => {
          const question = proposalForm.questions.find((q: Question) => q.id === response.question)
          if (!question || question.type !== 'number') return

          const value = response.value
          if (value === null || value === undefined || value === '') return

          // Check if value is a valid number
          const stringValue = String(value)
          if (!/^-?\d+$/.test(stringValue)) {
            errors.push(
              new yup.ValidationError(
                intl.formatMessage({ id: 'please-enter-a-number' }),
                response.value,
                `responses.${index}.value`,
                'number-format',
              ),
            )
            return
          }

          // Get range properties from the question (only exists on SimpleQuestion)
          const isRangeBetween = 'isRangeBetween' in question ? (question as any).isRangeBetween : false
          if (!isRangeBetween) return

          const rangeMin = 'rangeMin' in question ? (question as any).rangeMin : null
          const rangeMax = 'rangeMax' in question ? (question as any).rangeMax : null
          const numValue = parseInt(stringValue, 10)

          if (rangeMin !== null && rangeMin !== undefined && numValue < rangeMin) {
            errors.push(
              new yup.ValidationError(
                intl.formatMessage({ id: 'value-lower' }),
                response.value,
                `responses.${index}.value`,
                'number-range',
              ),
            )
            return
          }

          if (rangeMax !== null && rangeMax !== undefined && numValue > rangeMax) {
            errors.push(
              new yup.ValidationError(
                intl.formatMessage({ id: 'value-higher' }),
                response.value,
                `responses.${index}.value`,
                'number-range',
              ),
            )
          }
        })

        if (errors.length > 0) {
          throw new yup.ValidationError(errors)
        }

        return true
      }),

    // Social networks / External links (conditionally shown based on proposalForm config)
    // All are optional, empty strings are valid, non-empty must be valid URLs
    webPageUrl: urlSchema,
    facebookUrl: urlSchema,
    twitterUrl: urlSchema,
    instagramUrl: urlSchema,
    youtubeUrl: urlSchema,
    linkedInUrl: urlSchema,
  })
}

/**
 * Utility to compute which questions should be visible based on the current responses.
 * This implements the logic jump system where:
 * - If a question has jumps with conditions, the destination question is shown when conditions are met
 * - If a question has alwaysJumpDestinationQuestion, that question is shown when no jump conditions match
 * - Questions that are destinations of jumps are hidden by default until their conditions are met
 */
export const getAvailableQuestionIds = (questions: readonly Question[], responses: ResponseValue[]): Set<string> => {
  // Find all questions that are destinations of jumps (they should be hidden by default)
  const jumpDestinations = new Set<string>()
  questions.forEach(q => {
    if (q.alwaysJumpDestinationQuestion) {
      jumpDestinations.add(q.alwaysJumpDestinationQuestion.id)
    }
    q.jumps.forEach(jump => {
      jumpDestinations.add(jump.destination.id)
    })
  })

  // Build a map of question ID to response value
  // Note: The map accepts all possible value formats (string, string[], object, null)
  // because different question types return different formats
  const responseMap = new Map<string, ResponseValue['value']>()
  responses.forEach(r => {
    responseMap.set(r.question, r.value)
  })

  // Determine which destination questions should be shown based on conditions
  const visibleDestinations = new Set<string>()

  questions.forEach(question => {
    const response = responseMap.get(question.id)
    const hasResponse = response !== null && response !== undefined && response !== ''

    // Check each jump's conditions
    let hasMatchingJump = false
    for (const jump of question.jumps) {
      // Check if all conditions of this jump are met
      const conditionsMet = jump.conditions.every(condition => {
        const conditionResponse = responseMap.get(condition.question.id)
        const choiceId = condition.value.id

        // Handle different response formats:
        // - Array of strings (checkbox/ranking)
        // - String (radio/button/text)
        // - Object { value: string, label: string } (select)
        let responseMatches = false
        if (Array.isArray(conditionResponse)) {
          // Checkbox/ranking: array of choice IDs
          responseMatches = conditionResponse.includes(choiceId)
        } else if (isSelectResponse(conditionResponse)) {
          // Select: object with value property
          responseMatches = conditionResponse.value === choiceId
        } else {
          // Radio/button/text: direct string value
          responseMatches = conditionResponse === choiceId
        }

        return condition.operator === 'IS' ? responseMatches : !responseMatches
      })

      if (conditionsMet && jump.conditions.length > 0) {
        visibleDestinations.add(jump.destination.id)
        hasMatchingJump = true
        break // Only show the first matching jump destination
      }
    }

    // If no jump conditions matched but there's a response and an alwaysJump, show it
    if (!hasMatchingJump && hasResponse && question.alwaysJumpDestinationQuestion) {
      visibleDestinations.add(question.alwaysJumpDestinationQuestion.id)
    }
  })

  // A question is available if:
  // 1. It's not a jump destination (orphan/independent question), OR
  // 2. It's a jump destination that should be visible based on conditions
  const availableIds = new Set<string>()
  questions.forEach(q => {
    if (!jumpDestinations.has(q.id) || visibleDestinations.has(q.id)) {
      availableIds.add(q.id)
    }
  })

  return availableIds
}
