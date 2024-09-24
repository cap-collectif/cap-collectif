import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateSelectionStepMutation,
  UpdateSelectionStepMutation$variables,
  UpdateSelectionStepMutation$data,
} from '@relay/UpdateSelectionStepMutation.graphql'

const mutation = graphql`
  mutation UpdateSelectionStepMutation($input: UpdateSelectionStepInput!) {
    updateSelectionStep(input: $input) {
      selectionStep {
        id
        label
      }
      proposalStepSplitViewWasDisabled
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateSelectionStepMutation$variables): Promise<UpdateSelectionStepMutation$data> =>
  commitMutation<UpdateSelectionStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
