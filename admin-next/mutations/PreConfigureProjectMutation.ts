import {graphql} from 'react-relay';
import {environment} from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    PreConfigureProjectMutationVariables,
    PreConfigureProjectMutationResponse, PreConfigureProjectMutation,
} from '@relay/PreConfigureProjectMutation.graphql';

const mutation = graphql`
  mutation PreConfigureProjectMutation($input: PreConfigureProjectInput!) {
    preConfigureProject(input: $input) {
        project {
          adminAlphaUrl
          id
          title
          steps {
            __typename
            id
            label
            title
            body
            enabled
            ...on CollectStep {
              form {
                id
                title
              }
              defaultSort
              defaultStatus {
                name
              }
            }
            ...on SelectionStep {
              mainView
              statuses {
                name
              }
              defaultStatus {
                name
              }
              requirements {
                edges {
                  node {
                    __typename
                    ...on CheckboxRequirement {
                      label
                    }
                  }
                }
              }
            }
          }
        }
    }
  }
`;

const commit = (
    variables: PreConfigureProjectMutationVariables,
): Promise<PreConfigureProjectMutationResponse> =>
    commitMutation<PreConfigureProjectMutation>(environment, {
        mutation,
        variables,
    });

export default {commit};