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
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
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
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
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
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should not ask if proposal has no author.', async () => {
    await runSql('UPDATE proposal SET author_id = NULL WHERE id = "proposalIdf1"')
    const response = await graphql(
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
    expect(response).toMatchSnapshot()
    await runSql('UPDATE proposal SET author_id = "userKiroule" WHERE id = "proposalIdf1"')
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it("should not ask if proposal's author has no email.", async () => {
    await runSql('UPDATE fos_user SET email = NULL WHERE id = "userKiroule"')
    const response = await graphql(
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
    expect(response).toMatchSnapshot()
    await runSql('UPDATE fos_user SET email = "pierre@cap-collectif.com" WHERE id = "userKiroule"')
  })
  // user
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
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
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
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
