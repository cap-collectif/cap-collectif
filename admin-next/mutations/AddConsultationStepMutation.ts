import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  AddConsultationStepMutation,
  AddConsultationStepMutation$variables,
  AddConsultationStepMutation$data,
} from '@relay/AddConsultationStepMutation.graphql'

const mutation = graphql`
  mutation AddConsultationStepMutation($input: AddStepInput!) {
    addConsultationStep(input: $input) {
      step {
        adminUrl(operationType: CREATE)
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: AddConsultationStepMutation$variables): Promise<AddConsultationStepMutation$data> =>
  commitMutation<AddConsultationStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
