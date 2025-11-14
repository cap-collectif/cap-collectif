/* eslint-env jest */
import '../../../_setup'

const UpdateProposalSocialNetworksMutation = /* GraphQL */ `
  mutation UpdateProposalSocialNetworksMutation($input: UpdateProposalSocialNetworksInput!) {
    updateProposalSocialNetworks(input: $input) {
      proposal {
        webPageUrl
        facebookUrl
        twitterUrl
      }
      errorCode
    }
  }
`

describe('Internal | Update proposal social networks without sn', () => {
  it('update proposal sn', async () => {
    const updateProposalSocialNetwork = await graphql(
      UpdateProposalSocialNetworksMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalAvecDesRsAAjouter'),
          twitterUrl: 'https://twitter.com/capco',
        },
      },
      'internal_user',
    )
    expect(updateProposalSocialNetwork).toMatchSnapshot()
  })

  it('Update proposal social networks with existing sn', async () => {
    const updateProposalWithSocialNetwork = await graphql(
      UpdateProposalSocialNetworksMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalAvecDesRsAModifier'),
          twitterUrl: 'https://twitter.com/capco',
        },
      },
      'internal_user',
    )
    expect(updateProposalWithSocialNetwork).toMatchSnapshot()
  })
  it('remove twitter url on proposal social networks with existing sn', async () => {
    const updateProposalWithSocialNetwork = await graphql(
      UpdateProposalSocialNetworksMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalAvecDesRsAModifier'),
          twitterUrl: null,
        },
      },
      'internal_user',
    )
    expect(updateProposalWithSocialNetwork).toMatchSnapshot()
  })
})
