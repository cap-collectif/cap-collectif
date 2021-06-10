// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environnement from '~/createRelayEnvironment';
import type { CancelEmailChangeMutationResponse as Response } from '~relay/CancelEmailChangeMutation.graphql';

const mutation = graphql`
  mutation CancelEmailChangeMutation {
    cancelEmailChange {
      success
    }
  }
`;

const commit = (variables: null = null): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
  });

export default { commit };
