/* eslint-env jest */
import '../../../_setupDB'

const follow = /* GraphQL */ `
  mutation FollowProposalMutation($input: FollowProposalInput!) {
    followProposal(input: $input) {
      proposal {
        id
        viewerFollowingConfiguration
      }
    }
  }
`

const unfollow = /* GraphQL */ `
  mutation UnfollowProposalMutation($input: UnfollowProposalInput!) {
    unfollowProposal(input: $input) {
      proposal {
        id
      }
    }
  }
`

const proposalId = 'UHJvcG9zYWw6cHJvcG9zYWw4' // Proposal:proposal8

const followingProposals = /* GraphQL */ `
  query FollowingProposalsQuery {
    viewer {
      followingProposals(first: 32) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

const getFollowedProposalIds = async () => {
  const response = await graphql(followingProposals, {}, 'internal_admin')

  return response.viewer.followingProposals.edges.map(({ node }) => node.id)
}

describe('Internal|follow proposal', () => {
  it('follows a proposal with the selected notification level', async () => {
    const response = await graphql(follow, { input: { proposalId, notifiedOf: 'MINIMAL' } }, 'internal_admin')

    expect(response.followProposal.proposal).toEqual({ id: proposalId, viewerFollowingConfiguration: 'MINIMAL' })
    await expect(getFollowedProposalIds()).resolves.toContain(proposalId)
  })

  it('unfollows a proposal after following it', async () => {
    await graphql(follow, { input: { proposalId, notifiedOf: 'MINIMAL' } }, 'internal_admin')
    const response = await graphql(unfollow, { input: { proposalId } }, 'internal_admin')

    expect(response.unfollowProposal.proposal).toEqual({ id: proposalId })
    await expect(getFollowedProposalIds()).resolves.not.toContain(proposalId)
  })
})
