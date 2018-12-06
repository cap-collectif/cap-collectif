// @flow
import { graphql } from 'react-relay';
import environment from '../createRelayEnvironment';
import commitMutation from './commitMutation';
import type {
  DeleteProjectDistrictMutationVariables,
  DeleteProjectDistrictMutationResponse,
} from './__generated__/DeleteProjectDistrictMutation.graphql';

const mutation = graphql`
  mutation DeleteProjectDistrictMutation($input: DeleteProjectDistrictInput!) {
    deleteProjectDistrict(input: $input) {
      deletedDistrictId
    }
  }
`;

const getOptimisticResponse = variables => ({
  deleteProjectDistrict: {
    id: variables.input.id,
  },
});

const commit = (
  variables: DeleteProjectDistrictMutationVariables,
): Promise<DeleteProjectDistrictMutationResponse> =>
  commitMutation(environment, {
    mutation,
    variables,
    optimisticResponse: getOptimisticResponse(variables),
    configs: [
      {
        type: 'NODE_DELETE',
        deletedIDFieldName: 'deletedDistrictId',
      },
    ],
  });

export default { commit };
