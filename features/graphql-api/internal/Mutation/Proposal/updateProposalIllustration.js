/* eslint-env jest */
import '../../../_setup'

const UpdateProposalIllustrationMutation = /* GraphQL */ `
  mutation UpdateProposalIllustrationMutation($input: UpdateProposalIllustrationInput!) {
    updateProposalIllustration(input: $input) {
      proposal {
        media {
          id
          name
          url
        }
      }
      errorCode
    }
  }
`

describe('Internal | Update proposal illustration without illustration', () => {
  it('add illustration on proposal', async () => {
    const updateProposalIllustration = await graphql(
      UpdateProposalIllustrationMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalAvecDesRsAAjouter'),
          media: 'imageConfinement',
        },
      },
      'internal_user',
    )
    expect(updateProposalIllustration).toMatchSnapshot()
  })

  it('Update proposal illustration with illustration', async () => {
    const updateProposalIllustration = await graphql(
      UpdateProposalIllustrationMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalAvecDesRsAModifier'),
          media: 'imageOculus',
        },
      },
      'internal_user',
    )
    expect(updateProposalIllustration).toMatchSnapshot()
  })

  it('remove illustration on proposal', async () => {
    const updateProposalIllustration = await graphql(
      UpdateProposalIllustrationMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalAvecDesRsAModifier'),
          media: null,
        },
      },
      'internal_user',
    )
    expect(updateProposalIllustration).toMatchSnapshot()
  })

  it('proposal not found', async () => {
    const updateProposalIllustration = await graphql(
      UpdateProposalIllustrationMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalDoesntExist'),
          media: null,
        },
      },
      'internal_user',
    )
    expect(updateProposalIllustration).toMatchSnapshot()
  })

  it('access denied', async () => {
    const updateProposalIllustration = await graphql(
      UpdateProposalIllustrationMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalAvecDesRsAModifier'),
          media: null,
        },
      },
      'internal_kiroule',
    )
    expect(updateProposalIllustration).toMatchSnapshot()
  })
  it('media not found', async () => {
    const updateProposalIllustration = await graphql(
      UpdateProposalIllustrationMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalAvecDesRsAModifier'),
          media: 'notExistingMedia',
        },
      },
      'internal_user',
    )
    expect(updateProposalIllustration).toMatchSnapshot()
  })
})
