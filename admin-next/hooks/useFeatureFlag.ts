import { useLazyLoadQuery, graphql } from 'react-relay';
import invariant from '../utils/invariant';
import { useFeatureFlagQuery } from '@relay/useFeatureFlagQuery.graphql';
import { FeatureFlags } from '../types';

const query = graphql`
    query useFeatureFlagQuery {
        featureFlags {
            type
            enabled
        }
    }
`;

const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
    const data = useLazyLoadQuery<useFeatureFlagQuery>(query, {}, { fetchPolicy: 'store-only' });
    invariant(data.featureFlags !== undefined, 'The featureFlags are is missing in Relay store.');

    const featureFlag = data.featureFlags.find(f => f.type === flag);
    invariant(featureFlag !== undefined, 'The featureFlag "%s" is missing in Relay store.', flag);

    return featureFlag.enabled;
};

export default useFeatureFlag;
