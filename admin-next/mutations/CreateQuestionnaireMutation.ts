import { graphql } from 'react-relay';
import type { RecordSourceSelectorProxy } from 'relay-runtime';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
  CreateQuestionnaireMutation,
  CreateQuestionnaireMutationResponse,
  CreateQuestionnaireMutationVariables,
} from '@relay/CreateQuestionnaireMutation.graphql';
import {ModalCreateQuestionnaire_viewer} from '@relay/ModalCreateQuestionnaire_viewer.graphql'


const mutation = graphql`
    mutation CreateQuestionnaireMutation($input: CreateQuestionnaireInput!, $connections: [ID!]!)
    @raw_response_type
    {
        createQuestionnaire(input: $input) {
            questionnaire @prependNode(connections: $connections, edgeTypeName: "QuestionnaireEdge") {
                ...QuestionnaireItem_questionnaire
                adminUrl
            }
        }
    }
`;

const commit = (
  variables: CreateQuestionnaireMutationVariables,
  isAdmin: boolean,
  owner: ModalCreateQuestionnaire_viewer,
  hasQuestionnaire: boolean,
): Promise<CreateQuestionnaireMutationResponse> =>
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
          owner,
        },
      },
    },
    updater: (store: RecordSourceSelectorProxy) => {
      if (!hasQuestionnaire) {
        return;
      }
      const payload = store.getRootField('createQuestionnaire');
      if (!payload) return;
      const errorCode = payload.getValue('errorCode');
      if (errorCode) return;

      const rootFields = store.getRoot();
      const viewer = rootFields.getLinkedRecord('viewer');
      if (!viewer) return;
      const questionnaires = viewer.getLinkedRecord('questionnaires', {
        affiliations: isAdmin ? null : ['OWNER'],
      });
      if (!questionnaires) return;

      const totalCount = parseInt(String(questionnaires.getValue('totalCount')), 10);
      questionnaires.setValue(totalCount + 1, 'totalCount');
    },
  });

export default { commit };
