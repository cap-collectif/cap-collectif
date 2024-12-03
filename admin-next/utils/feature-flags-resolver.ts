import getRedisClient from './redis-client'
import { FeatureFlags } from '../types'
import { defaultFeatureFlags } from '@shared/hooks/useFeatureFlag'

const getRedisFeatureFlagKey = (flag: string) => {
  const prefix = process.env.NEXT_PUBLIC_SYMFONY_REDIS_PREFIX || process.env.SYMFONY_REDIS_PREFIX
  return `${prefix}feature_toggle__TOGGLE__${flag}`
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
