//* eslint-env jest */
const SelectionStepProposalsQuery = /* GraphQL */ `
  query SelectionStepProposalsQuery($id: ID!, $geoBoundingBox: GeoBoundingBox) {
    node(id: $id) {
      ... on SelectionStep {
        id
        title
        proposals(geoBoundingBox: $geoBoundingBox) {
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
`

const variables = {
  id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmM1ZvdGU=',
  geoBoundingBox: null,
}

describe('Internal|SelectionStep.proposals location argument', () => {
  it('fetches the proposals from a selection step filtered by a given bounding box', async () => {
    await expect(
      graphql(
        SelectionStepProposalsQuery,
        {
          ...variables,
          geoBoundingBox: {
            topLeft: {
              lat: 48.819734,
              lng: 2.569435,
            },
            bottomRight: {
              lat: 48.753003,
              lng: 2.673633,
            },
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
