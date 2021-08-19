// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  CreateQuestionnaireMutationResponse,
  CreateQuestionnaireMutationVariables,
} from '~relay/CreateQuestionnaireMutation.graphql';

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
        },
      },
    },
  });

export default { commit };
