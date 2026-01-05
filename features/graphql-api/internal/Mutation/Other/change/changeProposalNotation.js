/* eslint-env jest */
import '../../../../_setup'

const changeProposalNotationMutation = /* GraphQL */ `
  mutation ($input: ChangeProposalNotationInput!) {
    changeProposalNotation(input: $input) {
      proposal {
        estimation
        likers {
          id
        }
      }
    }
  }
`

describe('Internal|Proposal notation', () => {
  it('GraphQL client wants note a proposal', async () => {
    await expect(
      graphql(
        changeProposalNotationMutation,
        {
          input: {
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWw4',
            estimation: 1000,
            likers: ['VXNlcjp1c2VyMQ==', 'VXNlcjp1c2VyMg==', 'VXNlcjp1c2VyMw=='],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
