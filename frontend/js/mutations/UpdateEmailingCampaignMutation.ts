// @ts-nocheck
import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  UpdateEmailingCampaignMutationVariables,
  UpdateEmailingCampaignMutationResponse,
} from '~relay/UpdateEmailingCampaignMutation.graphql'

const mutation = graphql`
  mutation UpdateEmailingCampaignMutation($input: UpdateEmailingCampaignInput!) {
    updateEmailingCampaign(input: $input) {
      error
      emailingCampaign {
        ...MailParameterPage_emailingCampaign
      }
    }
  }
`

const commit = (variables: UpdateEmailingCampaignMutationVariables): Promise<UpdateEmailingCampaignMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
