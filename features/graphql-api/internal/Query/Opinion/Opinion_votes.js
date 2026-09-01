/* eslint-env jest */

const OpinionVotesQuery = /* GraphQL */ `
  query ($opinionId: ID!) {
    opinion: node(id: $opinionId) {
      ... on Opinion {
        votes(first: 10) {
          totalCount
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              author {
                id
              }
            }
          }
        }
      }
    }
  }
`

const OpinionYesVotesQuery = /* GraphQL */ `
  query ($opinionId: ID!) {
    opinion: node(id: $opinionId) {
      ... on Opinion {
        votes(first: 10, value: YES) {
          totalCount
          edges {
            cursor
            node {
              id
              author {
                _id
              }
              value
            }
          }
        }
      }
    }
  }
`

const variables = {
  opinionId: 'T3BpbmlvbjpvcGluaW9uNTc=',
}

describe('Internal|Opinion.votes connection', () => {
  it('lists the votes for an opinion', async () => {
    await expect(graphql(OpinionVotesQuery, variables, 'internal')).resolves.toMatchSnapshot()
  })

  it('lists the YES votes for an opinion', async () => {
    await expect(graphql(OpinionYesVotesQuery, variables, 'internal')).resolves.toMatchSnapshot()
  })
})
