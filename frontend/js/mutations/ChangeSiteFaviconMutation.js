// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeSiteFaviconMutationVariables,
  ChangeSiteFaviconMutationResponse,
} from '~relay/ChangeSiteFaviconMutation.graphql';

const mutation = graphql`
  mutation ChangeSiteFaviconMutation($input: InternalChangeSiteFaviconInput!) {
    changeSiteFavicon(input: $input) {
      siteFavicon {
        ...SiteFaviconAdminForm_siteFavicon
      }
    }
  }
`;
const commit = (
  variables: ChangeSiteFaviconMutationVariables,
): Promise<ChangeSiteFaviconMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
