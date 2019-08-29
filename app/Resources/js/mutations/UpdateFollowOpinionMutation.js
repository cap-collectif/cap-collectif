// @flow
import { graphql } from 'react-relay';
import commitMutation from './commitMutation';
import environnement from '../createRelayEnvironment';
import type {
  UpdateFollowOpinionMutationVariables,
  UpdateFollowOpinionMutationResponse as Response,
} from '~relay/UpdateFollowOpinionMutation.graphql';

const mutation = graphql`
  mutation UpdateFollowOpinionMutation($input: UpdateFollowOpinionInput!) {
    updateFollowOpinion(input: $input) {
      opinion {
        id
        ...OpinionFollowButton_opinion
        followers {
          totalCount
        }
      }
      followerEdge {
        node {
          id
          url
          displayName
          username
          media {
            url
          }
        }
        cursor
      }
    }
  }
`;

const commit = (variables: UpdateFollowOpinionMutationVariables): Promise<Response> =>
  commitMutation(environnement, {
    mutation,
    variables,
  });

export default { commit };
