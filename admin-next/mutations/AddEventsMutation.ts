import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';

import type {
    AddEventsMutation,
    AddEventsMutationVariables,
    AddEventsMutationResponse,
} from '@relay/AddEventsMutation.graphql';

const mutation = graphql`
    mutation AddEventsMutation($input: AddEventsInput!) {
        addEvents(input: $input) {
            importedEvents {
                id
            }
            notFoundEmails
            notFoundThemes
            notFoundProjects
            brokenDates
        }
    }
`;

const commit = (variables: AddEventsMutationVariables): Promise<AddEventsMutationResponse> =>
    commitMutation<AddEventsMutation>(environment, {
        mutation,
        variables,
    });

export default { commit };
