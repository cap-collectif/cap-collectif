import { graphql } from 'react-relay'
import { RecordSourceSelectorProxy } from 'relay-runtime'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateConsultationMutation,
  CreateConsultationMutation$data,
  CreateConsultationMutation$variables,
} from '@relay/CreateConsultationMutation.graphql'

const mutation = graphql`
  mutation CreateConsultationMutation($input: CreateConsultationInput!, $connections: [ID!]!) @raw_response_type {
    createConsultation(input: $input) {
      consultation @prependNode(connections: $connections, edgeTypeName: "ConsultationEdge") {
        ...ConsultationItem_consultation
        adminUrl
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: CreateConsultationMutation$variables,
  hasConsultation: boolean,
): Promise<CreateConsultationMutation$data> =>
  commitMutation<CreateConsultationMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      createConsultation: {
        consultation: {
          id: new Date().toISOString(),
          title: variables.input.title,
          createdAt: new Date().toString(),
          updatedAt: new Date().toString(),
          step: null,
          adminUrl: '',
        },
      },
    },
    updater: (store: RecordSourceSelectorProxy) => {
      if (!hasConsultation) return
      const payload = store.getRootField('createConsultation')
      if (!payload) return

      const rootFields = store.getRoot()
      const viewer = rootFields.getLinkedRecord('viewer')
      if (!viewer) return
      const consultations = viewer.getLinkedRecord('consultations')
      if (!consultations) return

      const consultationsTotalCount = parseInt(String(consultations.getValue('totalCount')), 10)
      consultations.setValue(consultationsTotalCount + 1, 'totalCount')
    },
  })

export default { commit }
