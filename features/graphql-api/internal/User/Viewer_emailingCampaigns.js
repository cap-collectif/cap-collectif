/* eslint-env jest */

const ViewerEmailingCampaignsQuery = /* GraphQL */ `
  query ViewerEmailingCampaignsQuery($affiliations: [EmailingCampaignAffiliation!]) {
    viewer {
      emailingCampaigns(affiliations: $affiliations) {
        totalCount
        edges {
          node {
            name
          }
        }
      }
    }
  }
`;

const ViewerEmailingCampaignSearchQuery = /* GraphQL */ `
  query ViewerEmailingCampaignSearchQuery($term: String) {
    viewer {
      emailingCampaigns(term: $term) {
        totalCount
        edges {
          node {
            name
          }
        }
      }
    }
  }
`;

describe('Internal.viewer.emailingCampaigns', () => {
  it('project owner should get its campaigns', async () => {
    await expect(
      graphql(ViewerEmailingCampaignsQuery, { affiliations: ['OWNER'] }, 'internal_theo'),
    ).resolves.toMatchSnapshot();
  });
  it('project owner cannot get all campaigns', async () => {
    await expect(
      graphql(ViewerEmailingCampaignsQuery, { affiliations: [] }, 'internal_theo'),
    ).rejects.toThrowError('cannot request without affiliation');
  });
  it('admin can get its campaigns', async () => {
    await expect(
      graphql(ViewerEmailingCampaignsQuery, { affiliations: ['OWNER'] }, 'internal_admin'),
    ).resolves.toMatchSnapshot();
  });
  it('admin can get all campaigns', async () => {
    await expect(
      graphql(ViewerEmailingCampaignsQuery, { affiliations: [] }, 'internal_admin'),
    ).resolves.toMatchSnapshot();
  });
  it('search a campaign', async () => {
    await expect(
      graphql(ViewerEmailingCampaignSearchQuery, { term: 'COVID' }, 'internal_admin'),
    ).resolves.toMatchSnapshot();
  });
});
