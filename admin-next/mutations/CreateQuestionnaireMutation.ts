import { graphql } from 'react-relay'
import type { RecordSourceSelectorProxy } from 'relay-runtime'
import { environment } from 'utils/relay-environement'
import commitMutation from './commitMutation'
import { GraphQLTaggedNode } from 'relay-runtime'
import type {
  CreateQuestionnaireMutation,
  CreateQuestionnaireMutation$data,
  CreateQuestionnaireMutation$variables,
} from '@relay/CreateQuestionnaireMutation.graphql'
import { CreateFormModal_viewer$data } from '@relay/CreateFormModal_viewer.graphql'
import { QuestionnaireType } from '@relay/QuestionnaireListQuery.graphql'

type Owner = {
  readonly __typename: string
  readonly id: string
  readonly username: string | null
}

type Viewer = Pick<CreateFormModal_viewer$data, '__typename' | 'id' | 'username'>

const mutation = graphql`
  mutation CreateQuestionnaireMutation($input: CreateQuestionnaireInput!, $connections: [ID!]!) @raw_response_type {
    createQuestionnaire(input: $input) {
      questionnaire @prependNode(connections: $connections, edgeTypeName: "QuestionnaireEdge") {
        ...QuestionnaireItem_questionnaire
        adminUrl
        id
      }
    }
  }
` as GraphQLTaggedNode

const commit = (
  variables: CreateQuestionnaireMutation$variables,
  isAdmin: boolean,
  owner: Owner | null,
  viewer: Viewer | null,
  hasQuestionnaire: boolean,
  types?: Array<QuestionnaireType>,
): Promise<CreateQuestionnaireMutation$data> =>
  commitMutation<CreateQuestionnaireMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
      createQuestionnaire: {
        questionnaire: {
          id: new Date().toISOString(),
          title: variables.input.title,
          createdAt: new Date().toString(),
          updatedAt: new Date().toString(),
          step: null,
          adminUrl: '',
          owner: {
            __typename: owner?.__typename || '',
            id: owner?.id || '',
            username: owner?.username || '',
          },
          creator: {
            id: viewer?.id || '',
            username: viewer?.username || '',
          },
        },
      },
    },
    updater: (store: RecordSourceSelectorProxy) => {
      if (!hasQuestionnaire) {
        return
      }
      const payload = store.getRootField('createQuestionnaire')
      if (!payload) return
      const errorCode = payload.getValue('errorCode')
      if (errorCode) return

      const rootFields = store.getRoot()
      const viewer = rootFields.getLinkedRecord('viewer')
      if (!viewer) return

      const organization = viewer.getLinkedRecords('organizations')[0] ?? null
      const owner = organization ?? viewer

      const questionnaires = owner.getLinkedRecord('questionnaires', {
        affiliations: isAdmin ? null : ['OWNER'],
        types,
      })

      if (!questionnaires) return

      const totalCount = parseInt(String(questionnaires.getValue('totalCount')), 10)
      questionnaires.setValue(totalCount + 1, 'totalCount')
    },
  })

export default { commit }
