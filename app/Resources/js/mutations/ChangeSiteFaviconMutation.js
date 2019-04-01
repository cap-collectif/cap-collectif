// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ChangeSiteFaviconVariables,
  ChangeSiteFaviconResponse,
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
const commit = (variables: ChangeSiteFaviconVariables): Promise<ChangeSiteFaviconResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
