/* eslint-env jest */
import '../../../_setup'

const ToggleFeatureMutation = /* GraphQL */ `
  mutation toggleFeatureMutation($input: ToggleFeatureInput!) {
    toggleFeature(input: $input) {
      featureFlag {
        type
        enabled
      }
    }
  }
`

const successCases = [
  ['disables a feature as super-admin', 'internal_super_admin', { type: 'login_facebook', enabled: false }],
  ['enables a feature as super-admin', 'internal_super_admin', { type: 'login_facebook', enabled: true }],
  ['enables a feature as admin', 'internal_admin', { type: 'login_facebook', enabled: true }],
  ['disables a feature as admin', 'internal_admin', { type: 'login_facebook', enabled: false }],
]

const failureCases = [
  [
    'tries to toggle a non-existing feature',
    'internal_super_admin',
    { type: 'fake_feature', enabled: true },
    'Variable "$input" got invalid value',
  ],
  [
    'tries to toggle a feature as regular user',
    'internal_user',
    { type: 'login_facebook', enabled: false },
    'Access denied to this field.',
  ],
  [
    'tries to toggle a feature anonymously',
    'internal',
    { type: 'login_facebook', enabled: false },
    'Access denied to this field.',
  ],
]

const superAdminOnly = [
  'login_openid',
  'login_franceconnect',
  'login_saml',
  'login_cas',
  'remind_user_account_confirmation',
  'sso_by_pass_auth',
  'oauth2_switch_user',
]

describe('Internal|toggleFeature', () => {
  test.each(successCases)('%s', async (_label, user, input) => {
    await expect(graphql(ToggleFeatureMutation, { input }, user)).resolves.toMatchSnapshot()
  })

  test.each(failureCases)('%s', async (_label, user, input, error) => {
    await expect(graphql(ToggleFeatureMutation, { input }, user)).rejects.toThrowError(error)
  })

  test.each(superAdminOnly)('Toggles %s as super-admin', async feature => {
    await expect(
      graphql(ToggleFeatureMutation, { input: { type: feature, enabled: true } }, 'internal_super_admin'),
    ).resolves.toMatchSnapshot()
    await expect(
      graphql(ToggleFeatureMutation, { input: { type: feature, enabled: false } }, 'internal_super_admin'),
    ).resolves.toMatchSnapshot()
  })

  test.each(superAdminOnly)('Tries to toggle %s as admin', async feature => {
    await expect(
      graphql(ToggleFeatureMutation, { input: { type: feature, enabled: true } }, 'internal_admin'),
    ).rejects.toThrowError('Access denied to this field.')
    await expect(
      graphql(ToggleFeatureMutation, { input: { type: feature, enabled: false } }, 'internal_admin'),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
