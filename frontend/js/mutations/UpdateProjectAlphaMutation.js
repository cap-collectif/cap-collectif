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
          bodyUsingJoditWysiwyg
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
              edges {
                node {
                  id
                  type: __typename
                  ... on CheckboxRequirement {
                    label
                  }
                }
              }
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
            debateContentUsingJoditWysiwyg
          }
          ... on QuestionnaireStep {
            questionnaire {
              value: id
              label: title
            }
            footer
            footerUsingJoditWysiwyg
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
        archived
        locale {
          id
          traductionKey
          code
        }
        restrictedViewers {
          edges {
            node {
              value: id
              label: title
            }
          }
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
