/* eslint-env jest */
import '../../../_setup';

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
`;

describe('Internal | Update proposal social networks without sn', () => {
  it('update proposal sn', async () => {
    const updateProposal = await graphql(
      UpdateProposalSocialNetworksMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalAvecDesRsAAjouter'),
          twitterUrl: 'https://twitter.com/capco',
        },
      },
      'internal_user',
    );
    expect(updateProposal).toMatchSnapshot();
  });

  it('update proposal body with unauthorized iframe.', async () => {
    const updateProposal = await graphql(
      UpdateProposalSocialNetworksMutation,
      {
        input: {
          proposalId: toGlobalId('Proposal', 'proposalAvecDesRsAModifier'),
          twitterUrl: 'https://twitter.com/capco',
        },
      },
      'internal_user',
    );
    expect(updateProposal).toMatchSnapshot();
  });
});
