import { ProposalFormModal_proposalForm$data } from '@relay/ProposalFormModal_proposalForm.graphql'
import { IntlShape } from 'react-intl'
import * as z from 'zod'
import { ResponseValue } from './ProposalFormModal.type'

export type Question = ProposalFormModal_proposalForm$data['questions'][number]

/**
 * Type guard to check if a response value is a select field response (object with value/label)
 */
const isSelectResponse = (value: ResponseValue['value']): value is { value: string; label: string } => {
  return typeof value === 'object' && value !== null && 'value' in value && !Array.isArray(value)
}

export const createProposalSchema = (proposalForm: ProposalFormModal_proposalForm$data, intl: IntlShape) => {
  const requiredMessage = intl.formatMessage({ id: 'fill-field' })
  const invalidUrlMessage = intl.formatMessage({ id: 'global.constraints.url.invalid' }) // todo: translation key

  // Helper to validate URLs - empty string is valid, non-empty must be valid URL
  const urlSchema = z
    .string()
    .transform(val => val.trim())
    .pipe(z.union([z.literal(''), z.string().url({ message: invalidUrlMessage })]))

  return z.object({
    title: z.string().min(1, { message: requiredMessage }),
    summary: z.string().optional(),

    body:
      proposalForm.usingDescription && proposalForm.descriptionMandatory
        ? z.string().min(1, { message: requiredMessage })
        : z.string().optional(),

    theme:
      proposalForm.usingThemes && proposalForm.themeMandatory
        ? z.string().min(1, { message: requiredMessage })
        : z.string().optional(),

    category:
      proposalForm.usingCategories && proposalForm.categoryMandatory
        ? z.string().min(1, { message: requiredMessage })
        : z.string().optional(),

    district:
      proposalForm.usingDistrict && proposalForm.districtMandatory
        ? z.string().min(1, { message: requiredMessage })
        : z.string().optional(),

    address: z.string().optional(),

    media: z.object({ id: z.string(), url: z.string() }).nullable().optional(),

    // Question responses - dynamic based on questions in proposalForm
    // Questions support logic jumps (conditional visibility based on other responses)
    // Individual question validation (required flag) should be handled at the form level
    responses: z.array(
      z.object({
        question: z.string(), // Question ID
        value: z
          .union([
            z.string(), // text, textarea, editor, radio, button, number, siret, rna, majority
            z.array(z.string()), // checkbox (array of choice IDs), ranking (ordered array of choice IDs)
            z.object({ value: z.string(), label: z.string() }), // select (object format)
            z.object({
              labels: z.array(z.string()),
              other: z.string().nullable(),
            }), // radio/checkbox/button with isOtherAllowed
            z.null(), // unanswered
          ])
          .nullable()
          .optional(),
        medias: z.array(z.string()).optional(), // For medias question type - array of media IDs
      }),
    ),

    // Social networks / External links (conditionally shown based on proposalForm config)
    // All are optional, empty strings are valid, non-empty must be valid URLs
    webPageUrl: urlSchema.optional(),
    facebookUrl: urlSchema.optional(),
    twitterUrl: urlSchema.optional(),
    instagramUrl: urlSchema.optional(),
    youtubeUrl: urlSchema.optional(),
    linkedInUrl: urlSchema.optional(),
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
