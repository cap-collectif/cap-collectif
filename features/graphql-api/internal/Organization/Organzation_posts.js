/* eslint-env jest */
const OrganizationPosts = /* GraphQL */ `
  query OrganizationPosts($organizationId: ID!, $query: String, $orderBy: PostOrder) {
    node(id: $organizationId) {
      ...on Organization {
        posts(query: $query, orderBy: $orderBy) {
          totalCount
            edges {
              node {
                title
                creator {
                  username
                }
                owner {
                  username
                }
                createdAt
                updatedAt
              }
            }
        }
      }
    }
  }
`;

describe('Internal|Organization.Posts', () => {
  it('organization admin should be able to fetch all posts from organization', async () => {
    await expect(
      graphql(
        OrganizationPosts,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
        },
        'internal_valerie'
      ),
    ).resolves.toMatchSnapshot();
  });
  it('organization admin should be able to fetch posts from organization filter by query', async () => {
    await expect(
      graphql(
        OrganizationPosts,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
          query: 'Deuxieme'
        },
        'internal_valerie'
      ),
    ).resolves.toMatchSnapshot();
  });
  it('organization admin should be able to fetch posts from organization ordered by updated_at desc', async () => {
    await expect(
      graphql(
        OrganizationPosts,
        {
          organizationId: toGlobalId('Organization', 'organization2'),
          orderBy: {
            field: 'UPDATED_AT',
            direction: 'DESC',
          }
        },
        'internal_valerie'
      ),
    ).resolves.toMatchSnapshot();
  });
})