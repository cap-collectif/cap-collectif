/* eslint-env jest */
import '../../_setup';

const UpdateOrganization = /* GraphQL*/ `
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      organization {
        title 
        body
        logo {
          url
        }
        banner {
          url
        }
        socialNetworks {
          facebookUrl
          webPageUrl
          twitterUrl
          instagramUrl
          linkedInUrl
          youtubeUrl
        }
      }
    }
  }
`;

const input = {
  "organizationId": "T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjI=",
  "translations": [
    {
      "title": "Titre",
      "body": "<p>Body</p>",
      "locale": "FR_FR"
    }
  ],
  "logo": "gymnase",
  "banner": "imageArchived",
  "facebookUrl": "/fb",
  "webPageUrl": "/webpage",
  "twitterUrl": "/twitter",
  "instagramUrl": "/instagram",
  "linkedInUrl": "/linkedIn",
  "youtubeUrl": "/youtube"
}

describe('mutations.updateOrganization', () => {
  it('admin should be able to edit organization', async () => {
    const response = await graphql(
      UpdateOrganization,
      {
        input
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
  it('admin organization should be able to edit organization', async () => {
    const response = await graphql(
      UpdateOrganization,
      {
        input
      },
      'internal_valerie',
    );
    expect(response).toMatchSnapshot();
  });
  it('organization member with role user should not be able to edit organization', async () => {
    await expect(
      graphql(UpdateOrganization, { input }, 'internal_user'),
    ).rejects.toThrowError('Access denied to this field.');
  });
})

