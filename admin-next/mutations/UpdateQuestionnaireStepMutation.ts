import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateQuestionnaireStepMutation,
  UpdateQuestionnaireStepMutation$data,
  UpdateQuestionnaireStepMutation$variables,
} from '@relay/UpdateQuestionnaireStepMutation.graphql'

const mutation = graphql`
  mutation UpdateQuestionnaireStepMutation($input: UpdateQuestionnaireStepInput!) {
    updateQuestionnaireStep(input: $input) {
      questionnaireStep {
        title
        label
        body
        timeRange {
          startAt
          endAt
        }
        enabled
        timeless
        isAnonymousParticipationAllowed
        collectParticipantsEmail
        metaDescription
        customCode
        questionnaire {
          id
          title
          description
          questions {
            id
            ...responsesHelper_adminQuestion @relay(mask: false)
          }
          questionsWithJumps: questions(filter: JUMPS_ONLY) {
            id
            title
            jumps(orderBy: { field: POSITION, direction: ASC }) {
              id
              origin {
                id
                title
              }
              destination {
                id
                title
                number
              }
              conditions {
                id
                operator
                question {
                  id
                  title
                  type
                }
                ... on MultipleChoiceQuestionLogicJumpCondition {
                  value {
                    id
                    title
                  }
                }
              }
            }
            # unused for now, will be usefull when we'll add error and warning messages
            destinationJumps {
              id
              origin {
                id
                title
              }
            }

            alwaysJumpDestinationQuestion {
              id
              title
              number
            }
          }
        }
        project {
          adminAlphaUrl
        }
        requirements {
          edges {
            node {
              id
              __typename
              ... on CheckboxRequirement {
                label
              }
            }
          }
        }
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateQuestionnaireStepMutation$variables): Promise<UpdateQuestionnaireStepMutation$data> =>
  commitMutation<UpdateQuestionnaireStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
