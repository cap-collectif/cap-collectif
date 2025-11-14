/* eslint-env jest */
import '../../../_setup'

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

describe('mutations|addMediators', () => {
  beforeEach(async () => {
    await global.enableFeatureFlag('mediator')
  })
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
