/* eslint-env jest */
import '../../../_setupES'

const SelectionStepProposalVotesQuery = /* GraphQL */ `
  query SelectionStepProposalVotesQuery($selectionStepId: ID!, $count: Int) {
    selectionStep: node(id: $selectionStepId) {
      id
      ... on SelectionStep {
        isSecretBallot
        canDisplayBallot
        proposals(first: $count) {
          totalCount
          edges {
            node {
              id
              votes(first: $count, stepId: $selectionStepId) {
                totalCount
                edges {
                  node {
                    id
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

const SelectionStepProposalVotesWithFormQuery = /* GraphQL */ `
  query SelectionStepProposalVotesWithFormQuery($selectionStepId: ID!, $count: Int) {
    selectionStep: node(id: $selectionStepId) {
      id
      ... on SelectionStep {
        isSecretBallot
        canDisplayBallot
        proposals(first: $count) {
          totalCount
          edges {
            node {
              id
              votes(first: $count, stepId: $selectionStepId) {
                totalCount
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
        form {
          objectType
        }
      }
    }
  }
`

const count = 3

describe('Internal|SelectionStep.proposals votes connection', () => {
  it('lists votes for proposals in a selection step', async () => {
    await expect(
      graphql(
        SelectionStepProposalVotesQuery,
        {
          selectionStepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
          count,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('lists votes for the question form in a selection step', async () => {
    await expect(
      graphql(
        SelectionStepProposalVotesWithFormQuery,
        {
          selectionStepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25RdWVzdGlvblN0ZXBWb3RlQ2xhc3NlbWVudA==',
          count,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('hides votes for proposals in a secret ballot', async () => {
    await expect(
      graphql(
        SelectionStepProposalVotesWithFormQuery,
        {
          selectionStepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmM1ZvdGU=',
          count,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
