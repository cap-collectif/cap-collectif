// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  ReviewEventMutationResponse,
  ReviewEventMutationVariables,
} from '~relay/ReviewEventMutation.graphql';

const mutation = graphql`
  mutation ReviewEventMutation($input: ReviewEventInput!) {
    reviewEvent(input: $input) {
      event {
        id
        review {
          status
          comment
          refusedReason
        }
      }
      userErrors {
        message
      }
    }
  }
`;

const commit = (variables: ReviewEventMutationVariables): Promise<ReviewEventMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
