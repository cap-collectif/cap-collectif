/* eslint-env jest */

const AllContributionsQuery = /* GraphQL */ `
  query AllContributionsQuery {
    allContributions
  }
`

describe('Internal|Query.allContributions', () => {
  it('returns the total number of contributions', async () => {
    await expect(graphql(AllContributionsQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })
})
