/* eslint-env jest */
import '../../_setupDB'

const AskProposalRevisionMutation = /* GraphQL*/ `
  mutation askProposalRevision($input: AskProposalRevisionInput!) {
    askProposalRevision(input: $input) {
      errorCode
      proposal {
        id
        revisions(state: PENDING) {
          edges {
            node {
              author {
                username
              }
              state
              reason
              expiresAt
              body
            }
          }
        }
      }
    }
  }
`
const DENIED_ERROR_MESSAGE = 'Access denied to this field.'

describe('mutations.askProposalRevision', () => {
  // admin
  it('admin should ask a revision on proposal.', async () => {

    const askProposalRevisionMutation = await graphql(
      AskProposalRevisionMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalIdf1'),
          reason: 'Le champs cout est incomplet !',
          body: 'Blablabla',
          expiresAt: '2030-11-14 11:59:30',
        },
      },
      'internal_admin',
    )
    expect(askProposalRevisionMutation).toMatchSnapshot()

  })
  it('admin should ask a revision on proposal,even if date expires after analyse step end.', async () => {

    const askProposalRevisionMutation = await graphql(
      AskProposalRevisionMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalIdf1'),
          reason: 'Le champs cout est incomplet !',
          body: '<p>Blablabla</p>',
          expiresAt: '2130-11-14 11:59:30',
        },
      },
      'internal_admin',
    )
    expect(askProposalRevisionMutation).toMatchSnapshot()

  })
  // user
  it('user should not ask a revision on proposal.', async () => {
    await expect(
      graphql(
        AskProposalRevisionMutation,
        {
          input: {
            proposalId: toGlobalId('Proposal', 'proposalIdf1'),
            reason: 'Le champs cout est incomplet !',
            body: '<h1>Blablabla</h1>',
            expiresAt: '2030-11-14 11:59:30',
          },
        },
        'internal_user',
      ),
    ).rejects.toThrowError(DENIED_ERROR_MESSAGE)
  })
  // anonym
  it('anonym should not ask a revision on proposal.', async () => {
    await expect(
      graphql(
        AskProposalRevisionMutation,
        {
          input: {
            proposalId: toGlobalId('Proposal', 'proposalIdf1'),
            reason: 'Le champs cout est incomplet !',
            body: 'Blablabla',
            expiresAt: '2030-11-14 11:59:30',
          },
        },
        'internal',
      ),
    ).rejects.toThrowError(DENIED_ERROR_MESSAGE)
  })
})
