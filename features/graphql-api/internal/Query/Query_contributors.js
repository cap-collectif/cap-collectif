//* eslint-env jest */
const ContributorsQuery = /* GraphQL */ `
    query ContributorsQuery(
        $search: ContributorSearchInput
        $roles: [ContributorsRole]!
        $order: ContributorOrder
      ) {
        contributors(search: $search, roles: $roles, orderBy: $order) {
            totalCount
            edges {
                node {
                    id
                    email
                    ...on User {
                      roles
                    }
                }
            }
        }
    }
`;

describe('Internal|Query contributors', () => {

  it('fetches contributors with role admin', async () => {
    const variables =  {"roles": ["ROLE_ADMIN"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role super admin', async () => {
    const variables =  {"roles": ["ROLE_SUPER_ADMIN"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role organization', async () => {
    const variables =  {"roles": ["ORGANIZATION"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role user', async () => {
    const variables =  {"roles": ["ROLE_USER"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role super admin and contributors with role admin', async () => {
    const variables =  {"roles": ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role super admin and contributors with role organization', async () => {
    const variables =  {"roles": ["ROLE_SUPER_ADMIN", "ORGANIZATION"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role super admin and contributors with role user', async () => {
    const variables =  {"roles": ["ROLE_SUPER_ADMIN", "ROLE_USER"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role admin and contributors with role organization', async () => {
    const variables =  {"roles": ["ROLE_ADMIN", "ORGANIZATION"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role admin and contributors with role user', async () => {
    const variables =  {"roles": ["ROLE_ADMIN", "ROLE_USER"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role organization and contributors with role user', async () => {
    const variables =  {"roles": ["ORGANIZATION", "ROLE_USER"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role super admin, contributors with role admin and contributors with role organization', async () => {
    const variables =  {"roles": ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ORGANIZATION"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role super admin, contributors with role admin and contributors with role user', async () => {
    const variables =  {"roles": ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_USER"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role super admin, contributors with role organization and contributors with role user', async () => {
    const variables =  {"roles": ["ROLE_SUPER_ADMIN", "ORGANIZATION", "ROLE_USER"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with role admin, contributors with role organization and contributors with role user', async () => {
    const variables =  {"roles": ["ROLE_ADMIN", "ORGANIZATION", "ROLE_USER"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches contributors with all roles', async () => {
    const variables =  {"roles": ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ORGANIZATION", "ROLE_USER"]}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });

  it('fetches one contributor on all roles', async () => {
    const variables =  {"roles": ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ORGANIZATION", "ROLE_USER"], "search": {"fields": ["id", "email", "username"], "term": "lbrunet",}}
    await expect(graphql(ContributorsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });
});
