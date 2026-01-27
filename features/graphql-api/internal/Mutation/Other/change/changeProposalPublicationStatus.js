/* eslint-env jest */
import '../../../../_setupDB'

const ChangeProposalPublicationStatus = /* GraphQL */ `
  mutation ChangeProposalPublicationStatusMutation($input: ChangeProposalPublicationStatusInput!) {
    changeProposalPublicationStatus(input: $input) {
      proposal {
        publicationStatus
        trashedReason
      }
    }
  }
`

describe('mutations.changeProposalPublicationStatus', () => {
  it('GraphQL client wants to trash a proposal', async () => {
    await expect(
      graphql(
        ChangeProposalPublicationStatus,
        {
          input: {
            publicationStatus: 'TRASHED',
            trashedReason: 'POPO',
            proposalId: 'UHJvcG9zYWw6cHJvcG9zYWwx',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('should update the status to ARCHIVED', async () => {
    const createAnalysis = await graphql(
      ChangeProposalPublicationStatus,
      {
        input: {
          publicationStatus: 'ARCHIVED',
          proposalId: 'UHJvcG9zYWw6cHJvcG9zYWxBcmNoaXZpbmdTdGVwQXJjaGl2ZWQ=',
        },
      },
      'internal_admin',
    )
    expect(createAnalysis).toMatchSnapshot()
  })
})
