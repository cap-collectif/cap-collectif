//* eslint-env jest */
import '../../../_setupES'

const SelectionStepProposalsQuery = /* GraphQL */ `
  query SelectionStepProposalsQuery($id: ID!, $userType: ID, $status: ID, $excludeViewerVotes: Boolean) {
    node(id: $id) {
      ... on SelectionStep {
        id
        title
        proposals(first: 5, userType: $userType, status: $status, excludeViewerVotes: $excludeViewerVotes) {
          totalCount
          edges {
            node {
              status(step: $id) {
                id
                name
              }
              author {
                userType {
                  id
                  name
                }
              }
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
  id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ',
  userType: 'VXNlclR5cGU6MQ==',
  status: null,
}

describe('Preview|SelectionStep.proposals', () => {
  it('fetches the proposals from a selection step with status 4 & type 1 filters', async () => {
    await expect(
      graphql(
        SelectionStepProposalsQuery,
        {
          ...variables,
          status: 'status4',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches the proposals from a selection step with status 5 & type 1 filters', async () => {
    await expect(
      graphql(
        SelectionStepProposalsQuery,
        {
          ...variables,
          status: 'status5',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
