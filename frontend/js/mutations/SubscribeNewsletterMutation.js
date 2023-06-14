// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  SubscribeNewsletterMutationVariables,
  SubscribeNewsletterMutationResponse as Response,
} from '~relay/SubscribeNewsletterMutation.graphql';

export type SubscribeNewsletterMutationResponse = Response;

const mutation = graphql`
  mutation SubscribeNewsletterMutation($input: SubscribeNewsletterInput!) {
    subscribeNewsletter(input: $input) {
      email
      errorCode
    }
  }
`;

const commit = (variables: SubscribeNewsletterMutationVariables): Promise<Response> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
