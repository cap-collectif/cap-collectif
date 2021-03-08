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
          type: __typename
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
          ... on CollectStep {
            requirements {
              reason
            }
          }
          ... on SelectionStep {
            requirements {
              reason
            }
          }
          ... on ConsultationStep {
            requirements {
              reason
            }
          }
          ... on RequirementStep {
            requirements {
              reason
            }
          }
          ... on ProposalStep {
            requirements {
              reason
            }
          }
          ... on DebateStep {
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
