/* eslint-env jest */
import '../../../_setupES'

const ProposalVoteMiniumQuery = /* GraphQL */ `
  query ProposalVoteMiniumQuery($id: ID!, $includeNotAccounted: Boolean!, $includeUnpublished: Boolean!) {
    proposal: node(id: $id) {
      ... on Proposal {
        allVotes: votes(first: 0, includeNotAccounted: false, includeUnpublished: false) {
          totalCount
          edges {
            node {
              id
              ... on ProposalVote {
                isAccounted
                published
              }
            }
          }
        }
        votes(first: 100, includeNotAccounted: $includeNotAccounted, includeUnpublished: $includeUnpublished) {
          totalCount
          edges {
            node {
              id
              ... on ProposalVote {
                isAccounted
                published
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal.Proposal_votes', () => {
  it("fetches a proposal's accounted votes.", async () => {
    await expect(
      graphql(
        ProposalVoteMiniumQuery,
        {
          id: toGlobalId('Proposal', 'proposal132'),
          includeNotAccounted: false,
          includeUnpublished: false,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it("fetches a proposal's votes including not accounted.", async () => {
    await expect(
      graphql(
        ProposalVoteMiniumQuery,
        {
          id: toGlobalId('Proposal', 'proposal132'),
          includeNotAccounted: true,
          includeUnpublished: false,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it("fetches a proposal's votes including not accounted and unpublished.", async () => {
    await expect(
      graphql(
        ProposalVoteMiniumQuery,
        {
          id: toGlobalId('Proposal', 'proposal132'),
          includeNotAccounted: true,
          includeUnpublished: true,
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
