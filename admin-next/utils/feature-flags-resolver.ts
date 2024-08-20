import getRedisClient from './redis-client'
import { FeatureFlags } from '../types'
import { defaultFeatureFlags } from '@shared/hooks/useFeatureFlag'

const getRedisFeatureFlagKey = (flag: string) => {
  return `${process.env.SYMFONY_REDIS_PREFIX}feature_toggle__TOGGLE__${flag}`
}

export const decodePHPFlag = (encodedFlag: string): boolean => {
  return encodedFlag.includes(';i:2;')
}

const getFeatureFlags = async (): Promise<FeatureFlags> => {
  const redisClient = await getRedisClient()

  const featureFlags = defaultFeatureFlags

  for (const flag of Object.keys(featureFlags)) {
    const flagKey = getRedisFeatureFlagKey(flag)
    const encodedPHPFlag: string | null = await redisClient.get(flagKey)
    featureFlags[flag] = encodedPHPFlag ? decodePHPFlag(encodedPHPFlag) : !!encodedPHPFlag
  }

  return featureFlags
}

export default getFeatureFlags
