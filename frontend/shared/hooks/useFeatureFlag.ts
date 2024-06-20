import { useLazyLoadQuery, graphql } from 'react-relay'
import invariant from '../utils/invariant'
import { useFeatureFlagQuery, FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql'

const query = graphql`
  query useFeatureFlagQuery {
    featureFlags {
      type
      enabled
    }
  }
`

type FeatureFlagsEnabled<T> = {
  [key in T as FeatureFlagType]?: boolean
}

export const useFeatureFlag = (flag: FeatureFlagType): boolean => {
  const data = useLazyLoadQuery<useFeatureFlagQuery>(query, {}, { fetchPolicy: 'store-only' })
  invariant(data.featureFlags !== undefined, 'The featureFlags are missing in Relay store.')

  const featureFlag = data.featureFlags.find(f => f.type === flag)
  invariant(featureFlag !== undefined, 'The featureFlag "%s" is missing in Relay store.', flag)
  return featureFlag ? featureFlag.enabled : false
}

export const useFeatureFlags = <T extends FeatureFlagType>(flags: FeatureFlagType[]): FeatureFlagsEnabled<T> => {
  const data = useLazyLoadQuery<useFeatureFlagQuery>(query, {}, { fetchPolicy: 'store-only' })
  invariant(data.featureFlags !== undefined, 'The featureFlags are missing in Relay store.')

  return flags.reduce<FeatureFlagsEnabled<T>>((acc, featureFlag) => {
    const currentFlag = data.featureFlags.find(f => f.type === featureFlag)

    if (currentFlag) {
      acc[featureFlag] = currentFlag.enabled
    } else {
      invariant(currentFlag !== undefined, 'The featureFlag "%s" is missing in Relay store.', featureFlag)
    }

    return acc
  }, {})
}

export default useFeatureFlag
