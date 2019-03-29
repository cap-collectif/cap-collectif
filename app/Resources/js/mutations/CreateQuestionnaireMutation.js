// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateQuestionnaireMutationResponse,
  CreateQuestionnaireMutationVariables,
} from '~relay/CreateQuestionnaireMutation.graphql';

const mutation = graphql`
  mutation CreateQuestionnaireMutation($input: CreateQuestionnaireInput!) {
    createQuestionnaire(input: $input) {
      questionnaire {
        id
      }
    }
  }
`;

const commit = (
  variables: CreateQuestionnaireMutationVariables,
): Promise<CreateQuestionnaireMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
