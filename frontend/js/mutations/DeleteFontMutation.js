// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteFontMutationVariables,
  DeleteFontMutationResponse,
} from '~relay/DeleteFontMutation.graphql';

const mutation = graphql`
  mutation DeleteFontMutation($input: InternalDeleteFontInput!) {
    deleteFont(input: $input) {
      deletedFontId
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
    configs: [
      {
        type: 'NODE_DELETE',
        deletedIDFieldName: 'deletedFontId',
      },
    ],
  });

export default { commit };
