/* eslint-env jest */
import '../../../_setupDB'

const AddMediatorsMutation = /* GraphQL*/ `
  mutation AddMediators($input: AddMediatorsInput!) {
    addMediators(input: $input) {
      step {
        __typename
        title
      }
      mediators {
        edges {
          node {
            user {
              username
              roles
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
describe('mutations|addMediators', () => {
  it('admin add users as mediator.', async () => {
    const variables = {
      input: {
        usersId: ['VXNlcjp1c2VyNg==', 'VXNlcjp1c2VyNw=='],
        stepId: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMg==',
      },
    }
    const addMediators = await graphql(AddMediatorsMutation, variables, 'internal_admin')
    expect(addMediators).toMatchSnapshot()
  })
})
