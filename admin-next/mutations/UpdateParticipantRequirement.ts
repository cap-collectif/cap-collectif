import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateParticipantRequirementMutation,
  UpdateParticipantRequirementMutation$variables,
  UpdateParticipantRequirementMutation$data,
} from '@relay/UpdateParticipantRequirementMutation.graphql'

const mutation = graphql`
  mutation UpdateParticipantRequirementMutation($input: UpdateParticipantRequirementInput!) {
    updateParticipantRequirement(input: $input) {
      requirement {
        id
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: UpdateParticipantRequirementMutation$variables,
): Promise<UpdateParticipantRequirementMutation$data> =>
  commitMutation<UpdateParticipantRequirementMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
