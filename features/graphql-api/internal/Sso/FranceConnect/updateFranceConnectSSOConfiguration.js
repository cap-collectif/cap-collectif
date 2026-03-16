const SelectionStepMediatorsQuery = /* GraphQL */ `
  mutation ($input: UpdateFranceConnectSSOConfigurationInput!) {
    updateFranceConnectSSOConfiguration(input: $input) {
      fcConfiguration {
        environment
        clientId
        secret
        authorizationUrl
        accessTokenUrl
        userInfoUrl
        logoutUrl
        allowedData
        enabled
        useV2
      }
    }
  }
`;

describe('Internal|SSO.FranceConnect', () => {
  it('Admin wants to update France Connect configuration with v1', async () => {
    await expect(
      graphql(
        SelectionStepMediatorsQuery,
        {
          input: {
            environment: 'TESTING',
            clientId: 'account',
            secret: 'INSERT_A_REAL_SECRET',
            given_name: true,
            family_name: true,
            birthdate: true,
            birthplace: false,
            birthcountry: false,
            gender: true,
            email: true,
            preferred_username: false,
            enabled: true,
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('Admin wants to update France Connect configuration and turn it to production mode with v1', async () => {
    await expect(
      graphql(
        SelectionStepMediatorsQuery,
        {
          input: {
            environment: 'PRODUCTION',
            clientId: 'account',
            secret: 'INSERT_A_REAL_SECRET',
            given_name: true,
            family_name: true,
            birthdate: true,
            birthplace: false,
            birthcountry: false,
            gender: true,
            email: true,
            preferred_username: false,
            enabled: true,
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('Admin wants to update France Connect configuration with v2', async () => {
    await expect(
      graphql(
        SelectionStepMediatorsQuery,
        {
          input: {
            environment: 'TESTING',
            clientId: 'account',
            secret: 'INSERT_A_REAL_SECRET',
            given_name: true,
            family_name: true,
            birthdate: true,
            birthplace: false,
            birthcountry: false,
            gender: true,
            email: true,
            preferred_username: false,
            enabled: true,
            useV2: true,
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('Admin wants to update France Connect configuration and turn it to production mode', async () => {
    await expect(
      graphql(
        SelectionStepMediatorsQuery,
        {
          input: {
            environment: 'PRODUCTION',
            clientId: 'account',
            secret: 'INSERT_A_REAL_SECRET',
            given_name: true,
            family_name: true,
            birthdate: true,
            birthplace: false,
            birthcountry: false,
            gender: true,
            email: true,
            preferred_username: false,
            enabled: true,
            useV2: true,
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
