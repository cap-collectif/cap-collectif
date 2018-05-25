// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  RequestUserArchiveMutationVariables,
  RequestUserArchiveMutationResponse,
} from './__generated__/RequestUserArchiveMutation.graphql';

const mutation = graphql`
  mutation RequestUserArchiveMutation {
    requestUserArchive(input: {}) {
      viewer {
        id
        ...UserArchiveRequestButton_viewer
      }
    }
  }
`;

const commit = (
  variables: RequestUserArchiveMutationVariables,
): Promise<RequestUserArchiveMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
