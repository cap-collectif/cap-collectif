import { graphql } from 'react-relay'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  DeleteConsultationMutation,
  DeleteConsultationMutation$data,
  DeleteConsultationMutation$variables,
} from '@relay/DeleteConsultationMutation.graphql'

const mutation = graphql`
  mutation DeleteConsultationMutation($input: DeleteConsultationInput!, $connections: [ID!]!) @raw_response_type {
    deleteConsultation(input: $input) {
      deletedConsultationId @deleteEdge(connections: $connections)
    }
  }
` as GraphQLTaggedNode

const commit = (variables: DeleteConsultationMutation$variables): Promise<DeleteConsultationMutation$data> =>
  commitMutation<DeleteConsultationMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      deleteConsultation: {
        deletedConsultationId: variables.input.id,
      },
    },
    updater: store => {
      const payload = store.getRootField('deleteConsultation')
      if (!payload) return

      const rootFields = store.getRoot()
      const viewer = rootFields.getLinkedRecord('viewer')
      if (!viewer) return

      const allConsultations = viewer.getLinkedRecord('consultations')

      if (!allConsultations) return

      const totalCount = parseInt(String(allConsultations.getValue('totalCount')), 10)
      allConsultations.setValue(totalCount - 1, 'totalCount')
    },
  })

export default { commit }
