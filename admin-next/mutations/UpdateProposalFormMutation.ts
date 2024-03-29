import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import {
  UpdateProposalFormMutation,
  UpdateProposalFormMutation$data,
  UpdateProposalFormMutation$variables,
} from '@relay/UpdateProposalFormMutation.graphql'

const mutation = graphql`
  mutation UpdateProposalFormMutation($input: UpdateProposalFormInput!) {
    updateProposalForm(input: $input) {
      proposalForm {
        id
        title
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
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateProposalFormMutation$variables): Promise<UpdateProposalFormMutation$data> =>
  commitMutation<UpdateProposalFormMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
