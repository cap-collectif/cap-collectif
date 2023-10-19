// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateProposalIllustrationMutationVariables,
  UpdateProposalIllustrationMutationResponse,
} from '~relay/UpdateProposalIllustrationMutation.graphql'

const mutation = graphql`
  mutation UpdateProposalIllustrationMutation($input: UpdateProposalIllustrationInput!) {
    updateProposalIllustration(input: $input) {
      proposal {
        id
        media {
          id
          name
          url
        }
      }
      errorCode
    }
  }
`

const commit = (
  variables: UpdateProposalIllustrationMutationVariables,
): Promise<UpdateProposalIllustrationMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
