// @flow
import { graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  AddArgumentMutationVariables,
  AddArgumentMutationResponse,
} from './__generated__/AddArgumentMutation.graphql';

const mutation = graphql`
  mutation AddArgumentMutation($input: AddArgumentInput!) {
    addArgument(input: $input) {
      argumentEdge {
        cursor
        node {
          id
          ...ArgumentItem_argument
        }
      }
    }
  }
`;

const commit = (variables: AddArgumentMutationVariables): Promise<AddArgumentMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    configs: [
      {
        type: 'RANGE_ADD',
        parentID: variables.input.argumentableId,
        connectionInfo: [
          // We add the new argument in the last arguments corresponding row
          {
            key: 'ArgumentListViewPaginated_arguments',
            rangeBehavior: 'prepend',
            filters: {
              type: variables.input.type,
              orderBy: { direction: 'DESC', field: 'CREATED_AT' },
            },
          },
          // We add the new argument in the old arguments corresponding row
          {
            key: 'ArgumentListViewPaginated_arguments',
            rangeBehavior: 'append',
            filters: {
              type: variables.input.type,
              orderBy: { direction: 'ASC', field: 'CREATED_AT' },
            },
          },
          // We add the new argument in the popular arguments corresponding row
          {
            key: 'ArgumentListViewPaginated_arguments',
            rangeBehavior: 'append',
            filters: {
              type: variables.input.type,
              orderBy: { direction: 'DESC', field: 'VOTES' },
            },
          },
        ],
        edgeName: 'argumentEdge',
      },
    ],
    updater: store => {
      // We update the "FOR" or "AGAINST" row arguments totalCount
      const argumentableProxy = store.get(variables.input.argumentableId);
      const connection = ConnectionHandler.getConnection(
        argumentableProxy,
        'ArgumentList_allArguments',
        {
          type: variables.input.type,
        },
      );
      connection.setValue(connection.getValue('totalCount') + 1, 'totalCount');
    },
  });

export default { commit };
