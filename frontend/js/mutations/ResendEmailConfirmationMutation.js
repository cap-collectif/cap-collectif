// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environnement from '~/createRelayEnvironment';
import type { ResendEmailConfirmationMutationResponse as Response } from '~relay/ResendEmailConfirmationMutation.graphql';

const mutation = graphql`
  mutation ResendEmailConfirmationMutation {
    resendEmailConfirmation {
      errorCode
    }
  }
`;

const commit = (): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables: null
  });

export default { commit };
