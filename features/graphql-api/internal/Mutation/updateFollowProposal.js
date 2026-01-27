import '../../_setupDB'

const UpdateFollowProposalMutation = /* GraphQL */ `
  mutation UpdateFollowProposalMutation($input: UpdateFollowProposalInput!) {
    updateFollowProposal(input: $input) {
      proposal {
        id
        viewerFollowingConfiguration
      }
    }
  }
`

const input = {
  proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwx',
  notifiedOf: 'MINIMAL',
}

describe('mutations.updateFollowProposalMutation', () => {
  it('should update follow proposal with current user', async () => {
    await expect(graphql(UpdateFollowProposalMutation, { input: input }, 'internal_user')).resolves.toMatchSnapshot()
  })
})
