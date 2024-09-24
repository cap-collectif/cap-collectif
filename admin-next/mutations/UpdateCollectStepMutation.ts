import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateCollectStepMutation,
  UpdateCollectStepMutation$variables,
  UpdateCollectStepMutation$data,
} from '@relay/UpdateCollectStepMutation.graphql'

const mutation = graphql`
  mutation UpdateCollectStepMutation($input: UpdateCollectStepInput!) {
    updateCollectStep(input: $input) {
      collectStep {
        id
        label
      }
      proposalStepSplitViewWasDisabled
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateCollectStepMutation$variables): Promise<UpdateCollectStepMutation$data> =>
  commitMutation<UpdateCollectStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
