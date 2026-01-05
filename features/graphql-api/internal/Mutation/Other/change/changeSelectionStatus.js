/* eslint-env jest */
import '../../../../_setup'

const changeSelectionStatusMutation = /* GraphQL */ `
  mutation ($input: ChangeSelectionStatusInput!) {
    changeSelectionStatus(input: $input) {
      proposal {
        selections {
          step {
            id
          }
          status {
            id
          }
        }
      }
    }
  }
`

describe('Internal|Selection status', () => {
  it('GraphQL client wants to update proposal status', async () => {
    await expect(
      graphql(
        changeSelectionStatusMutation,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwz',
            statusId: 'status1',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()

    await expect(
      graphql(
        changeSelectionStatusMutation,
        {
          input: {
            stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwz',
            statusId: null,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
