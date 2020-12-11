// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteFontMutationVariables,
  DeleteFontMutationResponse,
} from '~relay/DeleteFontMutation.graphql';

const mutation = graphql`
  mutation DeleteFontMutation($input: DeleteFontInput!) {
    deleteFont(input: $input) {
      deletedFontId @deleteRecord
      bodyFont {
        id
        useAsBody
      }
      headingFont {
        id
        useAsHeading
      }
    }
  }
`;

const commit = (
  variables: DeleteFontMutationVariables,
  bodyFont: ?string,
  headingFont: ?string,
): Promise<DeleteFontMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse:
      bodyFont && headingFont
        ? {
            deleteFont: {
              deletedFontId: variables.input.id,
              bodyFont: {
                id: bodyFont,
                useAsBody: true,
              },
              headingFont: {
                id: headingFont,
                useAsHeading: true,
              },
            },
          }
        : undefined,
  });

export default { commit };
