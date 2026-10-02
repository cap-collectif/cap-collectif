/* eslint-env jest */
const SmsCreditsQuery = /* GraphQL */ `
  query SmsCreditsQuery {
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
describe('Internal|Query.smsCredits', () => {
  it('should list sms credits', async () => {
    await expect(graphql(SmsCreditsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
