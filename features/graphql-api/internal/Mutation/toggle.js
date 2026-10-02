/* eslint-env jest */
import '../../_setupDB'

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

describe('Internal|toggleFeature', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('toggles a feature as super-admin', async () => {
    await expect(
      graphql(
        ToggleFeatureMutation,
        {
          input: {
            type: 'login_facebook',
            enabled: false,
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('toggles a feature as admin', async () => {
    await expect(
      graphql(
        ToggleFeatureMutation,
        {
          input: {
            type: 'login_facebook',
            enabled: false,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('tries to toggle a feature anonymously', async () => {
    await expect(
      graphql(
        ToggleFeatureMutation,
        {
          input: {
            type: 'login_facebook',
            enabled: false,
          },
        },
        'internal',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
