/* eslint-env jest */
import '../../../_setupDB'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const mutation = /* GraphQL */ `
  mutation ShieldAuthorizedUsersOnly($input: ToggleFeatureInput!) {
    toggleFeature(input: $input) {
      featureFlag {
        type
        enabled
      }
    }
  }
`
const query = /* GraphQL */ `
  query PlatformAccessFlag {
    featureFlags {
      type
      enabled
    }
  }
`

/**
 * @jest-status compliant
 * @jest-reason Exercises the real internal API with explicit authorization and persistence assertions,
 * restored SQL fixtures and automatic feature flag cleanup.
 */
describe('Internal|shield_authorized_users_only', () => {
  // Authentication writes user connections, so restore SQL even after the last scenario fails.
  afterAll(async () => {
    try {
      await graphql('{ __typename }', {}, 'internal')
    } finally {
      await execFileAsync('docker', [
        'exec',
        '-u',
        'capco',
        '-w',
        '/var/www',
        'capco_application_1',
        'bash',
        '-lc',
        process.env.CI_SHARED_TEST_DATA === '1'
          ? 'bash .circleci/profile-mysql-restore.sh'
          : 'mysql -h database -u root symfony < var/db.backup',
      ])
    }
  })

  it('rejects enabling the restriction while the feature is disabled', async () => {
    await global.resetFeatureFlags({ shield_authorization_controls: false })
    const type = 'shield_authorized_users_only'
    await expect(graphql(mutation, { input: { type, enabled: true } }, 'internal_admin')).rejects.toThrow(
      'Access denied to this field.',
    )
    const result = await graphql(query, {}, 'internal_admin')
    expect(result.featureFlags.find(flag => flag.type === type)).toEqual({ type, enabled: false })
  })

  describe.each(['shield_authorization_controls', 'shield_authorized_users_only'])('%s', feature => {
    beforeEach(async () => {
      await global.resetFeatureFlags({ shield_authorization_controls: feature === 'shield_authorized_users_only' })
    })

    // These fixture accounts have ROLE_ADMIN and ROLE_SUPER_ADMIN respectively.
    test.each([
      ['admin', 'internal_admin'],
      ['super-admin', 'internal_super_admin'],
    ])('%s can enable and disable platform restriction', async (_role, identity) => {
      for (const enabled of [true, false]) {
        await expect(graphql(mutation, { input: { type: feature, enabled } }, identity)).resolves.toEqual({
          toggleFeature: { featureFlag: { type: feature, enabled } },
        })

        const result = await graphql(query, {}, identity)
        expect(result.featureFlags.find(flag => flag.type === feature)).toEqual({ type: feature, enabled })
      }
    })

    test.each([
      ['ordinary user', { email: 'user@test.com', password: 'user' }],
      ['anonymous visitor', null],
    ])('%s cannot enable platform restriction', async (_role, credentials) => {
      const result = await rawInternalGraphql(mutation, { input: { type: feature, enabled: true } }, credentials)

      expect(result.errors).toEqual([
        expect.objectContaining({ message: 'Access denied to this field.', path: ['toggleFeature'] }),
      ])
      expect(result.data.toggleFeature).toBeNull()

      const persisted = await graphql(query, {}, 'internal')
      expect(persisted.featureFlags.find(flag => flag.type === feature)).toEqual({ type: feature, enabled: false })
    })
  })
})
