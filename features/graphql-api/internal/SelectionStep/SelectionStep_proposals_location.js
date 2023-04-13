//* eslint-env jest */
const SelectionStepProposalsQuery = /* GraphQL */ `
  query SelectionStepProposalsQuery($id: ID!, $location: Location) {
    node(id: $id) {
      ... on SelectionStep {
        id
        title
        proposals(location: $location) {
          totalCount
          edges {
            node {
              address {
                lat
                lng
              }
              title
            }
          }
        }
      }
    }
  }
`;

const variables = {
  id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmM1ZvdGU=',
  location: null,
}

describe('Internal|SelectionStep.proposals location argument', () => {
  it('fetches the proposals from a selection step sorted by distance given capco office as central point', async () => {
    await expect(
      graphql(
        SelectionStepProposalsQuery,
        {
          ...variables,
          location: {
            "lat": 48.8485326,
            "lng": 2.3838816
          }
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
