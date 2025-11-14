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

describe('Internal|Query.smsOrders', () => {
  it('should list unprocessed orders', async () => {
    await expect(graphql(SmsOrders, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
