// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateOfficialResponseMutationResponse,
  UpdateOfficialResponseMutationVariables,
} from '~relay/UpdateOfficialResponseMutation.graphql'

const mutation = graphql`
  mutation UpdateOfficialResponseMutation($input: UpdateOfficialResponseInput!) {
    updateOfficialResponse(input: $input) {
      error
      officialResponse {
        proposal {
          ...ProposalAdminOfficialAnswerForm_proposal
        }
        id
      }
    }
  }
`

const commit = (variables: UpdateOfficialResponseMutationVariables): Promise<UpdateOfficialResponseMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
