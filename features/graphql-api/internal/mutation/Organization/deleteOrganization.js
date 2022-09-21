/* eslint-env jest */
import '../../../_setup';

const DeleteOrganization = /* GraphQL*/ `
  mutation DeleteOrganization($input: DeleteOrganizationInput!) {
    deleteOrganization(input: $input) {
      deletedOrganization {
        title
        slug
        body
        banner {
          url
        }
        logo {
          url
        }
        members {
          edges {
            node {
              user {
                username
              }
            }
          }
        }
        socialNetworks {
          webPageUrl
          facebookUrl
          twitterUrl
          youtubeUrl
          linkedInUrl
          instagramUrl
        }
      }
      errorCode
    }
  }
`;

const input = {
  "organizationId": global.toGlobalId('Organization', 'organization1'),
}

describe('mutations.updateOrganization', () => {
  it('admin should be able to delete organization and organization should be anonymized', async () => {
    const response = await graphql(
      DeleteOrganization,
      {input},
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
  it('admin organization should not be able to delete organization', async () => {
    await expect(
      graphql(DeleteOrganization, {input}, 'internal_valerie'),
    ).rejects.toThrowError('Access denied to this field.');
  });
  it('should return ORGANIZATION_NOT_FOUND errorCode', async () => {
    const response = await graphql(
      DeleteOrganization,
      {
        input: {
          organizationId: "abc"
        }
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
})

