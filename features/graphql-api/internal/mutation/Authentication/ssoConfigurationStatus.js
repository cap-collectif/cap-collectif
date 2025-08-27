/* eslint-env jest */
import '../../../_setup';

const ToggleSSOConfigurationStatus = /* GraphQL */ `
  mutation ToggleSSOConfigurationStatusMutation($input: ToggleSSOConfigurationStatusInput!) {
    toggleSSOConfigurationStatus(input: $input) {
      ssoConfiguration {
        __typename
        enabled
        id
      }
    }
  }
`;

const cases = [
  ['facebook', 'FacebookSSOConfiguration'],
  ['franceConnect', 'FranceConnectSSOConfiguration'],
  ['ssoOauth2', 'Oauth2SSOConfiguration'],
  ['cas', 'CASSSOConfiguration'],
];

describe('Internal|ssoConfigurationStatus', () => {
  test.each(cases)('Toggles twice the status of %s as admin', async (ssoId, ssoType) => {
    const ssoConfigurationId = global.toGlobalId(ssoType, ssoId);

    const firstResult = await graphql(
      ToggleSSOConfigurationStatus,
      { input: { ssoConfigurationId } },
      'internal_admin'
    );

    expect(firstResult).toMatchSnapshot({
      toggleSSOConfigurationStatus: {
        ssoConfiguration: {
          enabled: expect.any(Boolean),
        },
      },
    });

    const firstEnabled = firstResult.toggleSSOConfigurationStatus.ssoConfiguration.enabled;

    const secondResult = await graphql(
      ToggleSSOConfigurationStatus,
      { input: { ssoConfigurationId } },
      'internal_admin'
    );

    expect(secondResult).toMatchSnapshot({
      toggleSSOConfigurationStatus: {
        ssoConfiguration: {
          enabled: expect.any(Boolean),
        },
      },
    });

    expect(secondResult.toggleSSOConfigurationStatus.ssoConfiguration.enabled).toBe(!firstEnabled);
  });
});
