import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    UpdateShieldAdminFormMutation,
    UpdateShieldAdminFormMutationResponse,
    UpdateShieldAdminFormMutationVariables,
} from '@relay/UpdateShieldAdminFormMutation.graphql';

const mutation = graphql`
    mutation UpdateShieldAdminFormMutation($input: UpdateShieldAdminFormInput!) @raw_response_type {
        updateShieldAdminForm(input: $input) {
            shieldAdminForm {
                shieldMode
                translations {
                    locale
                    introduction
                }
                media {
                    id
                    name
                    size
                    type: contentType
                    url(format: "reference")
                }
            }
        }
    }
`;

const commit = (
    variables: UpdateShieldAdminFormMutationVariables,
): Promise<UpdateShieldAdminFormMutationResponse> =>
    commitMutation<UpdateShieldAdminFormMutation>(environment, {
        mutation,
        variables,
        optimisticUpdater: store => {
            const rootFields = store.getRoot();
            const shieldAdminForm = rootFields.getLinkedRecord('shieldAdminForm');
            if (!shieldAdminForm) return;

            shieldAdminForm.setValue(variables.input.shieldMode, 'shieldMode');
        },
        updater: store => {
            const payload = store.getRootField('updateShieldAdminForm');
            if (!payload) return;

            const rootFields = store.getRoot();
            const shieldAdminForm = rootFields.getLinkedRecord('shieldAdminForm');
            if (!shieldAdminForm) return;

            const newShieldAdminForm = payload.getLinkedRecord('shieldAdminForm');
            const newTranslations = newShieldAdminForm.getLinkedRecords('translations');
            const newShieldMode = newShieldAdminForm.getValue('shieldMode')

            shieldAdminForm.setValue(newShieldMode, 'shieldMode');
            shieldAdminForm.setLinkedRecords(newTranslations, 'translations');
        },
    });

export const toggleShield = (enabled: boolean) => {
    return commit({
        input: {
            shieldMode: enabled,
        },
    });
};

export default { commit };
