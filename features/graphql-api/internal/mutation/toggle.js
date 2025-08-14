/* eslint-env jest */
import '../../_setup';

const ToggleFeatureMutation = /* GraphQL */ `
    mutation toggleFeatureMutation($input: ToggleFeatureInput!) {
        toggleFeature(input: $input) {
            featureFlag {
                type
                enabled
            }
        }
    }
`;

describe('Internal|toggleFeature', () => {

  it('toggles a feature as super-admin', async () => {
    await expect(
      graphql(
        ToggleFeatureMutation,
        {
          input: {
            type: 'login_facebook',
            enabled: false,
          }
        },
        'internal_super_admin',
      )
    ).resolves.toMatchSnapshot();
  });

  it('toggles a feature as admin', async () => {
    await expect(
      graphql(
        ToggleFeatureMutation,
        {
          input: {
            type: 'login_facebook',
            enabled: false,
          }
        },
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });

  it('tries to toggle a feature anonymously', async () => {
    await expect(
      graphql(
        ToggleFeatureMutation,
        {
          input: {
            type: 'login_facebook',
            enabled: false,
          }
        },
        'internal',
      )
    ).rejects.toThrowError('Access denied to this field.');
  });




})
