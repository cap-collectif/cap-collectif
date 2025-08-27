/* eslint-env jest */
import '../../../_setup';

const CreateCASSSOConfiguration = /* GraphQL */ `
  mutation CreateCASSSOConfigurationMutation($input: CreateCASSSOConfigurationInput!) {
    createCASSSOConfiguration(input: $input) {
      ssoConfiguration {
        id
        name
        enabled
        casVersion
        casCertificate
        casServerUrl
      }
    }
  }
`;

const UpdateCASSSOConfuguration = /* GraphQL */ `
  mutation UpdateCASSSOConfigurationMutation($input: UpdateCASSSOConfigurationInput!) {
    updateCASSSOConfiguration(input: $input) {
      ssoConfiguration {
        id
        name
        enabled
        casVersion
        casCertificate
        casServerUrl
      }
    }
  }
`;

const DeleteSSOConfiguration = /* GraphQL */ `
  mutation DeleteSSOConfigurationMutation($input: DeleteSSOConfigurationInput!) {
    deleteSSOConfiguration(input: $input) {
      deletedSsoConfigurationId
    }
  }
`;

describe('Internal|SSO|CAS', () => {
  let createdId;

  it('Creates a config as super admin', async () => {
    const creationResult = await graphql(
      CreateCASSSOConfiguration,
      {
        input: {
          name: 'Test SSO',
          casVersion: 'v2',
          casCertificate: '--- TEST CREATE CONFIG CERTIFICATE ---',
          casServerUrl: 'https://test.dev/cas',
        }
      },
      'internal_super_admin'
    );

    expect(creationResult).toMatchSnapshot({
      createCASSSOConfiguration: {
        ssoConfiguration: {
          id: expect.any(String),
        },
      },
    });

    createdId = creationResult.createCASSSOConfiguration.ssoConfiguration.id;
  });

  it('Updates a config as super admin', async () => {
    await expect(
      graphql(
        UpdateCASSSOConfuguration,
        {
          input: {
            id: createdId,
            name: 'Cap collectif CAS Provider',
            casVersion: 'v3',
            casCertificate: '--- CERTIFICATE UPDATED ---',
            casServerUrl: 'https://new.url.com/cas',
          }
        },
        'internal_super_admin'
      )
    ).resolves.toMatchSnapshot({
      updateCASSSOConfiguration: {
        ssoConfiguration: {
          id: expect.any(String),
        },
      },
    });
  });

  it('Deletes a config as admin only', async () => {
    await expect(
      graphql(
        DeleteSSOConfiguration,
        {
          input: {
            id: createdId,
          }
        },
        'internal_admin'
      )
    ).resolves.toMatchSnapshot({
      deleteSSOConfiguration: {
        deletedSsoConfigurationId: expect.any(String),
      },
    });
  });

  it('Tries to create a config as admin only', async () => {
    await expect(
      graphql(
        CreateCASSSOConfiguration,
        {
          input: {
            name: 'Test SSO 2',
            casVersion: 'v1',
            casCertificate: 'youpie',
            casServerUrl: 'https://test.dev/cas',
          }
        },
        'internal_admin'
      )
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('Tries to update a config as admin only', async () => {
    await expect(
      graphql(
        UpdateCASSSOConfuguration,
        {
          input: {
            id: global.toGlobalId('CASSSOConfiguration', 'cas'),
            name: 'Cap collectif CAS Provider',
            casVersion: 'v3',
            casCertificate: '---osef---',
            casServerUrl: 'https://osef.com/cas',
          }
        },
        'internal_admin'
      )
    ).rejects.toThrowError('Access denied to this field.');
  });
});
