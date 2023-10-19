// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  AssignSupervisorToProposalsMutationVariables,
  AssignSupervisorToProposalsMutationResponse as Response,
} from '~relay/AssignSupervisorToProposalsMutation.graphql'

const mutation = graphql`
  mutation AssignSupervisorToProposalsMutation($input: AssignSupervisorToProposalsInput!) {
    assignSupervisorToProposals(input: $input) {
      errorCode
      proposals {
        edges {
          node {
            id
            ...AnalysisProposalListRole_proposal
            supervisor {
              id
              ...UserSearchDropdownChoice_user
            }
          }
        }
      }
    }
  }
`

const commit = (variables: AssignSupervisorToProposalsMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
