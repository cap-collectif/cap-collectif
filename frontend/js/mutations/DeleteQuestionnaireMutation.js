// @flow
import { graphql } from 'react-relay';
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
): Promise<DeleteQuestionnaireMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: {
      deleteQuestionnaire: {
        deletedQuestionnaireId: variables.input.id,
      },
    },
  });

export default { commit };
