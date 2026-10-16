import getRedisClient from './redis-client'
import getFeatureFlags from './feature-flags-resolver'
import getSessionFromSessionCookie from './session-resolver'

jest.mock('./redis-client', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const redisGet = jest.fn()
const originalRedisPrefix = process.env.SYMFONY_REDIS_PREFIX

/**
 * @jest-status compliant
 * @jest-reason Verifies the Redis namespaces selected for sessions and feature flags from request hostnames.
 */
describe('Symfony environment Redis routing', () => {
  beforeEach(() => {
    process.env.SYMFONY_REDIS_PREFIX = 'dev'
    redisGet.mockReset().mockResolvedValue(null)
    ;(getRedisClient as jest.Mock).mockResolvedValue({ get: redisGet })
  })

  afterAll(() => {
    if (originalRedisPrefix === undefined) {
      delete process.env.SYMFONY_REDIS_PREFIX
    } else {
      process.env.SYMFONY_REDIS_PREFIX = originalRedisPrefix
    }
  })

  it('uses the test namespace for Cypress sessions and feature flags', async () => {
    await getSessionFromSessionCookie('session-cookie', 'capco.test')
    await getFeatureFlags('capco.test')

    expect(redisGet).toHaveBeenCalledWith('devsession_json_new_test_session-cookie')
    expect(redisGet).toHaveBeenCalledWith('testfeature_toggle__TOGGLE__blog')
  })

  it('uses the development namespace for local sessions and feature flags', async () => {
    await getSessionFromSessionCookie('session-cookie', 'capco.dev')
    await getFeatureFlags('capco.dev')

    expect(redisGet).toHaveBeenCalledWith('devsession_json_new_dev_session-cookie')
    expect(redisGet).toHaveBeenCalledWith('devfeature_toggle__TOGGLE__blog')
  })
})
