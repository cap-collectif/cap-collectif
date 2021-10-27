/* eslint-env jest */

const ViewerMailingListsQuery = /* GraphQL */ `
  query ViewerMailingListQuery($affiliations: [MailingListAffiliation!]) {
    viewer {
      mailingLists(affiliations: $affiliations) {
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

const ViewerMailingListsSearchQuery = /* GraphQL */ `
  query ViewerMailingListSearchQuery($term: String) {
    viewer {
      mailingLists(term: $term) {
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

describe('Internal.viewer.mailingLists', () => {
  it('project owner should get its mailingLists', async () => {
    await expect(
      graphql(ViewerMailingListsQuery, { affiliations: ['OWNER'] }, 'internal_theo'),
    ).resolves.toMatchSnapshot();
  });
  it('project owner cannot get all mailingLists', async () => {
    await expect(
      graphql(ViewerMailingListsQuery, { affiliations: [] }, 'internal_theo'),
    ).rejects.toThrowError('cannot request without affiliation');
  });
  it('admin can get its mailingLists', async () => {
    await expect(
      graphql(ViewerMailingListsQuery, { affiliations: ['OWNER'] }, 'internal_admin'),
    ).resolves.toMatchSnapshot();
  });
  it('admin can get all mailingLists', async () => {
    await expect(
      graphql(ViewerMailingListsQuery, { affiliations: [] }, 'internal_admin'),
    ).resolves.toMatchSnapshot();
  });
  it('search a mailingList', async () => {
    await expect(
      graphql(ViewerMailingListsSearchQuery, { term: 'COVID' }, 'internal_admin'),
    ).resolves.toMatchSnapshot();
  });
});
