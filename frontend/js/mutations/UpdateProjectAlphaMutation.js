// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  UpdateProjectAlphaMutationVariables,
  UpdateProjectAlphaMutationResponse,
} from '~relay/UpdateProjectAlphaMutation.graphql';

const mutation = graphql`
  mutation UpdateProjectAlphaMutation($input: UpdateAlphaProjectInput!) {
    updateAlphaProject(input: $input) {
      project {
        _id
        id
        title
        metaDescription
        authors {
          value: id
          label: username
        }
        type {
          id
        }
        Cover: cover {
          id
          name
          size
          url
        }
        video
        themes {
          value: id
          label: title
        }
        districts {
          edges {
            node {
              value: id
              label: name
            }
          }
        }
        steps {
          id
          body
          __typename
          title
          slug
          timeless
          startAt: timeRange {
            startAt
          }
          endAt: timeRange {
            endAt
          }
          label
          isEnabled: enabled
          ... on RequirementStep {
            requirements {
              reason
            }
          }
          ... on DebateStep {
            isAnonymousParticipationAllowed
            debate {
              id
              opinions {
                totalCount
              }
              articles {
                edges {
                  node {
                    id
                    url
                  }
                }
              }
            }
            debateType
            debateContent
          }
          ... on QuestionnaireStep {
            questionnaire {
              value: id
              label: title
            }
          }
        }
        ...ProjectAccessAdminForm_project

        visibility
        publishedAt
        opinionCanBeFollowed
        isExternal
        externalLink
        externalContributionsCount
        externalParticipantsCount
        externalVotesCount
        url
        locale {
          id
          traductionKey
          code
        }
      }
    }
  }
`;

const commit = (
  variables: UpdateProjectAlphaMutationVariables,
): Promise<UpdateProjectAlphaMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
  });

export default { commit };
