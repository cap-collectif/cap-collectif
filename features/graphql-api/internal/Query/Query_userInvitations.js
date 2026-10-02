//* eslint-env jest */
const UserInvitationsQuery = /* GraphQL */ `
  query UserInvitationsQuery {
    userInvitations {
      edges {
        node {
          id
          email
          isAdmin
          isProjectAdmin
        }
      }
    }
  }
`

const DENIED_ERROR_MESSAGE = 'Access denied to this field'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|UserInvitations query', () => {
  it('should fetch the current available user invitations', async () => {
    await expect(graphql(UserInvitationsQuery, {}, 'internal_super_admin')).resolves.toMatchSnapshot()
  })
})

/**
 * @jest-status non-compliant
 * @jest-reason Checks only presence or a positive count instead of the expected API data or authorization
 * contract.
 */
describe('Internal|UserInvitations query access control', () => {
  it('should not throw an error has ROLE_ADMIN', async () => {
    expect.assertions(1)
    await expect(graphql(UserInvitationsQuery, {}, 'internal_admin')).resolves.not.toBeNull()
  })
})
