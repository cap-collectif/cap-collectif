// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateQuestionnaireMutationResponse,
  CreateQuestionnaireMutationVariables,
} from '~relay/CreateQuestionnaireMutation.graphql';
import { type Viewer } from '~/components/Admin/Project/QuestionnaireList/QuestionnaireListPage';

const mutation = graphql`
  mutation CreateQuestionnaireMutation($input: CreateQuestionnaireInput!, $connections: [ID!]!) {
    createQuestionnaire(input: $input) {
      questionnaire @prependNode(connections: $connections, edgeTypeName: "QuestionnaireEdge") {
        ...QuestionnaireItem_questionnaire
      }
    }
  }
`;

const commit = (
  variables: CreateQuestionnaireMutationVariables,
  isAdmin: boolean,
  owner: Viewer,
): Promise<CreateQuestionnaireMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      createQuestionnaire: {
        questionnaire: {
          id: new Date().toISOString(),
          title: variables.input.title,
          createdAt: new Date(),
          updatedAt: new Date(),
          step: null,
          adminUrl: '',
          owner,
        },
      },
    },
    updater: (store: RecordSourceSelectorProxy) => {
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

      const totalCount = parseInt(questionnaires.getValue('totalCount'), 10);
      questionnaires.setValue(totalCount + 1, 'totalCount');
    },
  });

export default { commit };
