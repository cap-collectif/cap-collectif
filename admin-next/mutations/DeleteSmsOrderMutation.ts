import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
  DeleteSmsOrderMutation,
  DeleteSmsOrderMutationResponse,
  DeleteSmsOrderMutationVariables,
} from '@relay/DeleteSmsOrderMutation.graphql';

const mutation = graphql`
    mutation DeleteSmsOrderMutation(
        $input: DeleteSmsOrderInput! 
        $connections: [ID!]!)
    @raw_response_type
    {
        deleteSmsOrder(input: $input) {
            deletedSmsOrderId @deleteEdge(connections: $connections)
            errorCode
        }
    }
`;

const commit = (
  variables: DeleteSmsOrderMutationVariables,
): Promise<DeleteSmsOrderMutationResponse> =>
  commitMutation<DeleteSmsOrderMutation>(environment, {
    mutation,
    variables,
    optimisticResponse: {
        deleteSmsOrder: {
          deletedSmsOrderId: variables.input.id,
          errorCode: null,
      },
    },
  });

export default { commit };
