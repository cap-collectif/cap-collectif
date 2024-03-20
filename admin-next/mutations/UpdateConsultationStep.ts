import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  UpdateConsultationStepMutation,
  UpdateConsultationStepMutation$variables,
  UpdateConsultationStepMutation$data,
} from '@relay/UpdateConsultationStepMutation.graphql'

const mutation = graphql`
  mutation UpdateConsultationStepMutation($input: UpdateConsultationStepInput!) {
    updateConsultationStep(input: $input) {
      consultationStep {
        adminUrl
      }
    }
  }
` as GraphQLTaggedNode

const commit = (variables: UpdateConsultationStepMutation$variables): Promise<UpdateConsultationStepMutation$data> =>
  commitMutation<UpdateConsultationStepMutation>(environment, {
    mutation,
    variables,
  })

export default { commit }
