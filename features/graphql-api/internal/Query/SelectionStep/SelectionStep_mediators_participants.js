//* eslint-env jest */
import '../../../_setupESOnce'

const SelectionStepMediatorsParticipantsQuery = /* GraphQL */ `
  query SelectionStepMediatorsParticipantsQuery($stepId: ID!, $mediatorId: ID, $orderBy: ParticipantOrder) {
    node(id: $stepId) {
      ... on SelectionStep {
        id
        mediators {
          edges {
            node {
              participants(orderBy: $orderBy) {
                totalCount
                edges {
                  node {
                    firstname
                    createdAt
                    votes(mediatorId: $mediatorId) {
                      edges {
                        node {
                          id
                          isAccounted
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
  }
`

const defaultVariables = {
  stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
  mediatorId: 'TWVkaWF0b3I6bWVkaWF0b3Ix',
  orderBy: { field: 'CREATED_AT', direction: 'DESC' },
}

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|SelectionStep.mediators.participants', () => {
  it('fetches the participants created by a mediator from a selectionStep', async () => {
    await expect(
      graphql(SelectionStepMediatorsParticipantsQuery, defaultVariables, 'mediator'),
    ).resolves.toMatchSnapshot()
  })
  it('fetches the participants created by a mediator from a selectionStep ordered by CREATED_AT ASC', async () => {
    await expect(
      graphql(
        SelectionStepMediatorsParticipantsQuery,
        {
          ...defaultVariables,
          orderBy: { field: 'CREATED_AT', direction: 'ASC' },
        },
        'mediator',
      ),
    ).resolves.toMatchSnapshot()
  })
})
