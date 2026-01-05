//* eslint-env jest */
const SelectionStepProposalsQuery = /* GraphQL */ `
  query SelectionStepProposalsQuery($id: ID!, $excludeViewerVotes: Boolean) {
    node(id: $id) {
      ... on SelectionStep {
        id
        title
        proposals(excludeViewerVotes: $excludeViewerVotes) {
          totalCount
          edges {
            node {
              title
              votes {
                edges {
                  node {
                    ... on ProposalVote {
                      author {
                        id
                        email
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const variables = {
  id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmM1ZvdGU=',
}

it('fetches the proposals from a selection step with excludeViewerVotes filter', async () => {
  await expect(
    graphql(
      SelectionStepProposalsQuery,
      {
        ...variables,
        excludeViewerVotes: false,
      },
      'internal_super_admin',
    ),
  ).resolves.toMatchSnapshot()

  await expect(
    graphql(
      SelectionStepProposalsQuery,
      {
        ...variables,
        excludeViewerVotes: true,
      },
      'internal_super_admin',
    ),
  ).resolves.toMatchSnapshot()
})
