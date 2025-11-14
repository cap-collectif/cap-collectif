/* eslint-env jest */
import '../../_setup'

const revokeAnalystsToProposalsMutation = /* GraphQL*/ `
  mutation revokeAnalystsToProposalsMutation($input: RevokeAnalystsToProposalsInput!) {
    revokeAnalystsToProposals(input: $input) {
      errorCode
      proposals {
        totalCount
        edges {
          node {
            title
            analysts {
              username
              id
            }
            analyses {
              analyst {
                username
                id
              }
            }
          }
        }
      }
      viewer {
        isAdmin
        username
      }
    }
  }
`

describe('mutations.revokeAnalystsToProposalsMutation logged as admin', () => {
  it('should revoke a list of analysts to a proposal.', async () => {
    const revokeAllAnalystToProposals = await graphql(
      revokeAnalystsToProposalsMutation,
      {
        input: {
          proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='],
          analystIds: ['VXNlcjp1c2VyMjY=', 'VXNlcjp1c2VyQW5hbHlzdA=='],
        },
      },
      'internal_admin',
    )
    expect(revokeAllAnalystToProposals).toMatchSnapshot()
  })

  it('should revoke all analyst to a proposal.', async () => {
    const revokeAllAnalystToProposals = await graphql(
      revokeAnalystsToProposalsMutation,
      {
        input: { proposalIds: ['UHJvcG9zYWw6cHJvcG9zYWwxMDk='], analystIds: [] },
      },
      'internal_admin',
    )
    expect(revokeAllAnalystToProposals).toMatchSnapshot()
  })
})
