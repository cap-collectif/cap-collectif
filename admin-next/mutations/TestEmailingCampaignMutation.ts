import { graphql } from 'react-relay'
import commitMutation from './commitMutation'
import { environment } from 'utils/relay-environement'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  TestEmailingCampaignMutation,
  TestEmailingCampaignMutation$data,
  TestEmailingCampaignMutation$variables,
} from '@relay/TestEmailingCampaignMutation.graphql'

const mutation = graphql`
  mutation TestEmailingCampaignMutation($input: TestEmailingCampaignInput!) {
    testEmailingCampaign(input: $input) {
      error
    }
  }
` as GraphQLTaggedNode

const commit = (variables: TestEmailingCampaignMutation$variables): Promise<TestEmailingCampaignMutation$data> =>
  commitMutation<TestEmailingCampaignMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
