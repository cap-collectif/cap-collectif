/* eslint-env jest */
const UserOrganizationsQuery = /* GraphQL */ `
    query UserOrganizationsQuery($id: ID!) {
        node(id: $id) {
            ... on User {
                organizations {
                    username
                }
            }
        }
    }
`;

describe('User.organizations connection', () => {
  it("fetches a user's organization when authenticated as admin.", async() => {
    await expect(
        graphql(
            UserOrganizationsQuery,
            {
              id: "VXNlcjp2YWxlcmllTWFzc29uRGVsbW90dGU=",
            },
            'internal_admin',
        ),
    ).resolves.toMatchSnapshot();
  });

  it("Cant fetch user's organization when user is not allowed.", async() => {
    await expect(
        graphql(
            UserOrganizationsQuery,
            {
              id: "VXNlcjp2YWxlcmllTWFzc29uRGVsbW90dGU=",
            },
            'internal_user',
        ),
    ).resolves.toMatchSnapshot();
  });

});
