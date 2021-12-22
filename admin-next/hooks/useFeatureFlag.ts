import { useLazyLoadQuery, graphql } from 'react-relay';
import invariant from '../utils/invariant';
import { useFeatureFlagQuery } from '@relay/useFeatureFlagQuery.graphql';
import type { FeatureFlags } from '../types';
import { defaultFeatureFlags } from '@utils/feature-flags-resolver';

const query = graphql`
    query useFeatureFlagQuery {
        featureFlags {
            type
            enabled
        }
    }
`;

type FeatureFlagsEnabled = {
    [key in keyof FeatureFlags]?: boolean
}

type useFeatureFlagReturn = boolean | FeatureFlagsEnabled

const useFeatureFlag = (flag: keyof FeatureFlags | (keyof FeatureFlags)[]): useFeatureFlagReturn => {
    const data = useLazyLoadQuery<useFeatureFlagQuery>(query, {}, { fetchPolicy: 'store-only' });
    invariant(data.featureFlags !== undefined, 'The featureFlags are missing in Relay store.');

    if(typeof flag === "string") {
        const featureFlag = data.featureFlags.find(f => f.type === flag);
        invariant(featureFlag !== undefined, 'The featureFlag "%s" is missing in Relay store.', flag);
        return featureFlag ? featureFlag.enabled : false;
    }

    if(Array.isArray(flag) && flag.length > 0) {
        return flag.reduce<FeatureFlagsEnabled>((acc, featureFlag) => {
            const currentFlag = data.featureFlags.find(f => f.type === featureFlag);

            if (currentFlag) {
                acc[featureFlag] = currentFlag.enabled;
            } else {
                invariant(currentFlag !== undefined, 'The featureFlag "%s" is missing in Relay store.', featureFlag);
            }

            return acc;
        }, {}) as unknown as FeatureFlagsEnabled
    }

    return false;
};

export const useAllFeatureFlags = (): FeatureFlags => {
    const data = useLazyLoadQuery<useFeatureFlagQuery>(query, {}, { fetchPolicy: 'store-only' });
    invariant(data.featureFlags !== undefined, 'The featureFlags are missing in Relay store.');

    return data.featureFlags.reduce<FeatureFlags>((acc, featureFlag) => {
        acc[featureFlag.type] = featureFlag.enabled;
        return acc;
    }, defaultFeatureFlags);
}

export default useFeatureFlag;
