/* eslint-env jest */
const SmsOrders = /* GraphQL */ `
  query SmsOrders {
    smsOrders {
      edges {
        node {
          id
          amount
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.smsOrders', () => {
  it('should list unprocessed orders', async () => {
    await expect(graphql(SmsOrders, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
