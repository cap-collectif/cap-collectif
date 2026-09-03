/* eslint-env jest */

const ProposalNewsRelatedContentQuery = /* GraphQL */ `
  query ProposalNewsRelatedContentQuery($proposalId: ID!) {
    proposal: node(id: $proposalId) {
      id
      ... on Proposal {
        news {
          edges {
            node {
              id
              title
              relatedContent {
                ... on Proposal {
                  id
                }
                ... on Theme {
                  id
                }
                ... on Project {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`

const ProposalNewsThemesQuery = /* GraphQL */ `
  query ProposalNewsThemesQuery($proposalId: ID!) {
    proposal: node(id: $proposalId) {
      id
      ... on Proposal {
        news {
          edges {
            node {
              id
              title
              relatedContent {
                ... on Theme {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`

const ProposalNewsProposalsQuery = /* GraphQL */ `
  query ProposalNewsProposalsQuery($proposalId: ID!) {
    proposal: node(id: $proposalId) {
      id
      ... on Proposal {
        news {
          edges {
            node {
              id
              title
              relatedContent {
                ... on Proposal {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`

const variables = { proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwx' }

describe('Internal|Proposal.news related content', () => {
  it('lists all related content of proposal news', async () => {
    await expect(
      graphql(ProposalNewsRelatedContentQuery, variables, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('lists only themes related to proposal news', async () => {
    await expect(graphql(ProposalNewsThemesQuery, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('lists only proposals related to proposal news', async () => {
    await expect(
      graphql(ProposalNewsProposalsQuery, variables, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
})
