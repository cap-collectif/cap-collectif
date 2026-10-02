//* eslint-env jest */
const SelectionStepMediatorsQuery = /* GraphQL */ `
  query SelectionStepMediatorsQuery($username: String) {
    node(id: "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==") {
      ... on SelectionStep {
        id
        title
        mediators(username: $username) {
          edges {
            node {
              user {
                username
              }
              totalParticipantsAccounted
              totalParticipantsOptIn
              votes {
                totalCount
                edges {
                  node {
                    isAccounted
                    participant {
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
`
const SelectionStepMediatorsUernameQuery = /* GraphQL */ `
  query SelectionStepMediatorsUernameQuery($username: String) {
    node(id: "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==") {
      ... on SelectionStep {
        id
        title
        mediators(username: $username) {
          edges {
            node {
              user {
                username
              }
            }
          }
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|SelectionStep.mediators', () => {
  it('fetches the mediators', async () => {
    await expect(graphql(SelectionStepMediatorsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })
  it('fetches the mediators with username filter', async () => {
    await expect(
      graphql(
        SelectionStepMediatorsUernameQuery,
        {
          username: 'toto',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()

    await expect(
      graphql(
        SelectionStepMediatorsUernameQuery,
        {
          username: 'mediator',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
