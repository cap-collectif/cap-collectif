import getRedisClient from './redis-client'
import { getEnv } from '../config'

const getRedisSessionKey = (cookie: string, host?: string) => {
  // We have a potential bug here, because we does not check `.lock` session key, too.
  return `${process.env.SYMFONY_REDIS_PREFIX}session_json_new_${getEnv(host)}_${cookie}`
}

const getSessionFromSessionCookie = async (cookie: string, host?: string): Promise<string | null> => {
  const sessionKey = getRedisSessionKey(cookie, host)
  const redisClient = await getRedisClient()
  const redisSession = await redisClient.get(sessionKey)

  return redisSession
}

export default getSessionFromSessionCookie
