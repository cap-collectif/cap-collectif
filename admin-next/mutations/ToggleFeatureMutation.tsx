import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    ToggleFeatureMutation,
    ToggleFeatureMutationResponse,
    ToggleFeatureMutationVariables,
} from '@relay/ToggleFeatureMutation.graphql';
import { FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql';
import { IntlShape } from 'react-intl';
import { mutationErrorToast } from '@utils/mutation-error-toast';

const mutation = graphql`
    mutation ToggleFeatureMutation($input: ToggleFeatureInput!) @raw_response_type {
        toggleFeature(input: $input) {
            featureFlag {
                type
                enabled
            }
        }
    }
`;

const commit = (
    variables: ToggleFeatureMutationVariables,
): Promise<ToggleFeatureMutationResponse> =>
    commitMutation<ToggleFeatureMutation>(environment, {
        mutation,
        variables,
        optimisticResponse: {
            toggleFeature: {
                featureFlag: {
                    type: variables.input.type,
                    enabled: variables.input.enabled,
                },
            },
        },
        optimisticUpdater: store => {
            const rootFields = store.getRoot();
            const featureFlags = rootFields.getLinkedRecords('featureFlags');
            if (!featureFlags) return;

            const currentFeatureFlag = featureFlags.find(
                featureFlag => featureFlag.getValue('type') === variables.input.type,
            );
            if (!currentFeatureFlag) return;
            currentFeatureFlag.setValue(variables.input.enabled, 'enabled');
        },
        updater: store => {
            const payload = store.getRootField('toggleFeature');
            if (!payload) return;

            const rootFields = store.getRoot();
            const featureFlags = rootFields.getLinkedRecords('featureFlags');
            if (!featureFlags) return;

            const currentFeatureFlag = featureFlags.find(
                featureFlag =>
                    featureFlag.getValue('type') ===
                    payload.getLinkedRecord('featureFlag').getValue('type'),
            );
            if (!currentFeatureFlag) return;
            currentFeatureFlag.setValue(
                payload.getLinkedRecord('featureFlag').getValue('enabled'),
                'enabled',
            );
        },
    });

export const toggleFeatureFlag = (
    name: FeatureFlagType,
    enabled: boolean,
    intl: IntlShape,
    callBack?: any,
): void => {
    callBack(true);

    commit({
        input: {
            type: name,
            enabled,
        },
    }).then(response => {
        if (!response.toggleFeature?.featureFlag) {
            mutationErrorToast(intl);
        }
    });

    callBack(false);
};

export default { commit };
