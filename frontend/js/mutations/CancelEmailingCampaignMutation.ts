// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '~/createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  CancelEmailingCampaignMutationVariables,
  CancelEmailingCampaignMutationResponse,
} from '~relay/CancelEmailingCampaignMutation.graphql'

const mutation = graphql`
  mutation CancelEmailingCampaignMutation($input: CancelEmailingCampaignInput!) {
    cancelEmailingCampaign(input: $input) {
      emailingCampaign {
        name
        ...ModalCancelSending_emailingCampaign
      }
      error
    }
  }
`

const commit = (variables: CancelEmailingCampaignMutationVariables): Promise<CancelEmailingCampaignMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
