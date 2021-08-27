// @flow
import { graphql } from 'react-relay';
// eslint-disable-next-line import/no-unresolved
import type { RecordSourceSelectorProxy } from 'relay-runtime/store/RelayStoreTypes';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteQuestionnaireMutationResponse,
  DeleteQuestionnaireMutationVariables,
} from '~relay/DeleteQuestionnaireMutation.graphql';

const mutation = graphql`
  mutation DeleteQuestionnaireMutation($input: DeleteQuestionnaireInput!, $connections: [ID!]!) {
    deleteQuestionnaire(input: $input) {
      deletedQuestionnaireId @deleteEdge(connections: $connections)
    }
  }
`;

const commit = (
  variables: DeleteQuestionnaireMutationVariables,
  isAdmin: boolean,
): Promise<DeleteQuestionnaireMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      deleteQuestionnaire: {
        deletedQuestionnaireId: variables.input.id,
      },
    },
    updater: (store: RecordSourceSelectorProxy) => {
      const payload = store.getRootField('deleteQuestionnaire');
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
      questionnaires.setValue(totalCount - 1, 'totalCount');
    },
  });

export default { commit };
