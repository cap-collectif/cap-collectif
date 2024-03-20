import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteStepMutation,
  DeleteStepMutation$data,
  DeleteStepMutation$variables,
} from '@relay/DeleteStepMutation.graphql'

const mutation = graphql`
  mutation DeleteStepMutation($input: DeleteStepInput!) {
    deleteStep(input: $input) {
      stepId
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteStepMutation$variables): Promise<DeleteStepMutation$data> =>
  commitMutation<DeleteStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
