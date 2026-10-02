/* eslint-env jest */
const UserInvitationsAvailabilitySearch = /* GraphQL */ `
  query UserInvitationsAvailabilitySearch($emails: [String!]!) {
    userInvitationsAvailabilitySearch(emails: $emails) {
      totalCount
      edges {
        node {
          email
          availableForUser
          availableForInvitation
        }
      }
    }
  }
`

describe('Internal|UserInvitationsAvailabilitySearch', () => {
  /**
   * @jest-status compliant
   * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable
   * fixture data.
   */
  it('denies anonymous access', async () => {
    await expect(
      graphql(
        UserInvitationsAvailabilitySearch,
        {
          emails: ['theo@cap-collectif.com', 'rem@chan.com'],
        },
        'internal',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should fetch the already used email addresses among the given ones', async () => {
    await expect(
      graphql(
        UserInvitationsAvailabilitySearch,
        {
          emails: ['theo@cap-collectif.com', 'rem@chan.com', 'ram@chan.com'],
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should not fetch already used email addresses among the new ones', async () => {
    await expect(
      graphql(
        UserInvitationsAvailabilitySearch,
        {
          emails: ['newemail@mail.com', 'anothernnewemail@mail.com'],
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
