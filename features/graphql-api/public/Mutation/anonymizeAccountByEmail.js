/* eslint-env jest */
import '../../_setupDB'

const AnonymizeAccountByEmail = /* GraphQL */ `
  mutation anonymizeAccountByEmail($input: AnonymizeAccountByEmailInput!) {
    anonymizeAccountByEmail(input: $input) {
      email
      errorCode
    }
  }
`

const AssociatedContentQuery = /* GraphQL */ `
  query AssociatedContentBeforeAccountAnonymization {
    openProposal: node(id: "UHJvcG9zYWw6cHJvcG9zYWwy") {
      ... on Proposal {
        id
        title
        body
        summary
        address {
          json
        }
        category {
          name
        }
        theme {
          id
          title
        }
        author {
          id
          username
          email
          deletedAccountAt
        }
      }
    }
    closedProposal: node(id: "UHJvcG9zYWw6cHJvcG9zYWwxMg==") {
      ... on Proposal {
        id
        title
        body
        summary
        address {
          json
        }
        category {
          name
        }
        theme {
          id
          title
        }
        author {
          id
          username
          email
          deletedAccountAt
        }
      }
    }
    event: node(id: "RXZlbnQ6ZXZlbnQx") {
      ... on Event {
        id
        title
        body
        link
        timeRange {
          startAt
          endAt
        }
        googleMapsAddress {
          json
        }
        author {
          id
          username
          email
          deletedAccountAt
        }
      }
    }
  }
`

const withoutAuthor = content => {
  const result = { ...content }
  delete result.author

  return result
}

describe('Anonymize account by email', () => {
  it('Returns an error for a non-existing email', async () => {
    await expect(
      graphql(AnonymizeAccountByEmail, { input: { email: 'nonExistingUser@cap-collectif.com' } }, 'super_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('Refuses to anonymize a super admin', async () => {
    await expect(
      graphql(AnonymizeAccountByEmail, { input: { email: 'lbrunet@cap-collectif.com' } }, 'super_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('Allows an admin to anonymize an account', async () => {
    await expect(
      graphql(AnonymizeAccountByEmail, { input: { email: 'userToDelete@cap-collectif.com' } }, 'admin'),
    ).resolves.toMatchSnapshot()
  })

  it('Refuses access to a regular user', async () => {
    await expect(
      graphql(AnonymizeAccountByEmail, { input: { email: 'userToDelete@cap-collectif.com' } }, 'user'),
    ).rejects.toMatchSnapshot()
  })

  it('Preserves associated content while anonymizing its author', async () => {
    const before = await graphql(AssociatedContentQuery, {}, 'super_admin')

    await expect(
      graphql(AnonymizeAccountByEmail, { input: { email: 'user@test.com' } }, 'super_admin'),
    ).resolves.toEqual({
      anonymizeAccountByEmail: {
        email: 'user@test.com',
        errorCode: null,
      },
    })

    const after = await graphql(AssociatedContentQuery, {}, 'super_admin')

    for (const contentName of ['openProposal', 'closedProposal', 'event']) {
      expect(after[contentName]).not.toBeNull()
      expect(withoutAuthor(after[contentName])).toEqual(withoutAuthor(before[contentName]))
      expect(after[contentName].author.id).toBe(before[contentName].author.id)
      expect(after[contentName].author.email).toBeNull()
      expect(after[contentName].author.deletedAccountAt).not.toBeNull()
      expect(after[contentName].author.username).not.toBe(before[contentName].author.username)
    }
  })
})
