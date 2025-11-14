/* eslint-env jest */
import '../../_setup'

const DeleteProposal = /* GraphQL*/ `
    mutation DeleteProposal($input: DeleteProposalInput!) {
        deleteProposal(input: $input) {
            proposal {
                id
            }
        }
    }
`

describe('mutations.deleteProposal', () => {
  it('as proposal author should not be able to delete a proposal when preventProposalDelete is enabled in the step', async () => {
    await global.runSQL('UPDATE step SET prevent_proposal_delete = 1 WHERE id = "collectstepIdf"')

    await expect(
      graphql(
        DeleteProposal,
        {
          input: {
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWxJZGYx', // proposalIdf1
          },
        },
        'internal_kiroule',
      ),
    ).rejects.toThrowError("Can't delete proposal")
  })
})

// TODO migrate tests from deleteProposal.feature to this file
