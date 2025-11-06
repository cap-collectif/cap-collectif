/* eslint-env jest */

const collectStatusMutation = /* GraphQL */ `
  mutation ($input: ChangeCollectStatusInput!) {
    changeCollectStatus(input: $input) {
      proposal {
        status {
          id
        }
      }
    }
  }
`

describe('Internal|Collect status', () => {
  it('GraphQL client wants to change proposal collect status', async () => {
    await expect(
      graphql(
        collectStatusMutation,
        {
          input: {
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwy',
            statusId: 'status3',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
