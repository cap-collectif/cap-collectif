import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
  CreateSmsOrderMutation,
  CreateSmsOrderMutationResponse,
  CreateSmsOrderMutationVariables,
} from '@relay/CreateSmsOrderMutation.graphql';

const mutation = graphql`
    mutation CreateSmsOrderMutation($input: CreateSmsOrderInput!)
    @raw_response_type
    {
        createSmsOrder(input: $input) {
            smsOrder {
                id
                amount
                createdAt
                updatedAt
            }
        }
    }
`;

const commit = (
  variables: CreateSmsOrderMutationVariables,
): Promise<CreateSmsOrderMutationResponse> =>
  commitMutation<CreateSmsOrderMutation>(environment, {
    mutation,
    variables,
  });

export default { commit };
