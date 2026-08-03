/* eslint-env jest */
import '../../../_setupDB'

const mutation = /* GraphQL */ `
  mutation ApplyProposalStatusMutation($input: ApplyProposalStatusInput!) {
    applyProposalStatus(input: $input) {
      error
      status {
        id
      }
      proposals {
        edges {
          node {
            id
            status {
              id
            }
            selections {
              status {
                id
              }
            }
          }
        }
      }
    }
  }
`

const proposalId = 'UHJvcG9zYWw6cHJvcG9zYWwx' // Proposal:proposal1

describe('Internal|apply proposal status', () => {
  it('rejects unknown proposals and statuses', async () => {
    await expect(
      graphql(
        mutation,
        { input: { proposalIds: ['idonotexist', 'meneither'], statusId: 'nostatus' } },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it.each([
    ['status4', 'status1', 'status4'],
    ['status5', 'status1', 'status5'],
    ['status2', 'status2', 'status4'],
    [null, null, null],
  ])('applies status %s to the matching proposal state', async (statusId, proposalStatusId, selectionStatusId) => {
    const response = await graphql(mutation, { input: { proposalIds: [proposalId], statusId } }, 'internal_admin')

    expect(response.applyProposalStatus).toMatchObject({
      error: null,
      status: statusId === null ? null : { id: statusId },
      proposals: {
        edges: [
          {
            node: {
              id: proposalId,
              status: proposalStatusId === null ? null : { id: proposalStatusId },
              selections: [{ status: selectionStatusId === null ? null : { id: selectionStatusId } }],
            },
          },
        ],
      },
    })
  })

  it('returns an error when the status does not belong to the proposal step', async () => {
    const response = await graphql(
      mutation,
      { input: { proposalIds: [proposalId], statusId: 'status6' } },
      'internal_admin',
    )

    expect(response.applyProposalStatus.error).toBe('NO_VALID_PROPOSAL')
  })
})
