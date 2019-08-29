// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RemoveSiteFaviconVariables,
  RemoveSiteFaviconResponse,
} from '~relay/RemoveSiteFaviconMutation.graphql';

const mutation = graphql`
  mutation RemoveSiteFaviconMutation($input: InternalRemoveSiteFaviconInput!) {
    removeSiteFavicon(input: $input) {
      siteFavicon {
        ...SiteFaviconAdminForm_siteFavicon
      }
    }
  }
`;
const commit = (variables: RemoveSiteFaviconVariables): Promise<RemoveSiteFaviconResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
