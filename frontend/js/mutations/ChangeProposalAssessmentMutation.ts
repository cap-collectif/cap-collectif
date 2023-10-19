// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  ChangeProposalAssessmentMutationVariables,
  ChangeProposalAssessmentMutationResponse,
} from '~relay/ChangeProposalAssessmentMutation.graphql'

const mutation = graphql`
  mutation ChangeProposalAssessmentMutation($input: ChangeProposalAssessmentInput!) {
    changeProposalAssessment(input: $input) {
      errorCode
      assessment {
        id
        proposal {
          id
          assessment {
            body
            estimatedCost
            officialResponse
            state
            supervisor {
              id
            }
          }
        }
        state
        body
        estimatedCost
        officialResponse
        supervisor {
          id
        }
      }
    }
  }
`

const commit = (
  variables: ChangeProposalAssessmentMutationVariables,
): Promise<ChangeProposalAssessmentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
