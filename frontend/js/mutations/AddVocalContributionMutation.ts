import { graphql } from 'react-relay'
import environment from '../createRelayEnvironment'
import commitMutation from './commitMutation'
import type {
  AddVocalContributionMutation$variables,
  AddVocalContributionMutation$data,
} from '~relay/AddVocalContributionMutation.graphql'

const mutation = graphql`
  mutation AddVocalContributionMutation($input: AddVocalContributionInput!) {
    addVocalContribution(input: $input) {
      contributionId
      shouldTriggerParticipationWorkflow
      shouldTriggerConsentInternalCommunication
      completionStatus
      participantToken
    }
  }
`

const commit = (variables: AddVocalContributionMutation$variables): Promise<AddVocalContributionMutation$data> =>
  commitMutation(environment, {
    mutation,
    variables,
  })

export default {
  commit,
}
