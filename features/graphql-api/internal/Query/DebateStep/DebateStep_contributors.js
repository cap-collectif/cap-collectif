/* eslint-env jest */
const DebateStepContributorsQuery = /* GraphQL */ `
  query DebateStepContributors($id: ID!, $count: Int!, $cursor: String) {
    node(id: $id) {
      ... on DebateStep {
        contributors(first: $count, after: $cursor) {
          edges {
            cursor
            node {
              id
              username
            }
          }
          totalCount
          pageInfo {
            startCursor
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
`

describe('Internal|Debate.contributors connection', () => {
  it('fetches debate step contributors', async () => {
    await expect(
      graphql(
        DebateStepContributorsQuery,
        {
          count: 10,
          id: toGlobalId('DebateStep', 'debateStepCannabis'),
          cursor: null,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('fetches debate step contributors with cursor', async () => {
    await expect(
      graphql(
        DebateStepContributorsQuery,
        {
          count: 10,
          id: toGlobalId('DebateStep', 'debateStepCannabis'),
          cursor: 'YToyOntpOjA7aToxO2k6MTtpOjE1MTQ5ODMwMjAwMDA7fQ==',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
