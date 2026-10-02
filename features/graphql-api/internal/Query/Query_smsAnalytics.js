/* eslint-env jest */
const SmsAnalyticsQuery = /* GraphQL */ `
  query SmsAnalyticsQuery {
    smsAnalytics {
      remainingCredits {
        amount
        status
      }
      consumedCredits
      totalCredits
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.smsAnalytics', () => {
  it('should query sms analytics', async () => {
    await expect(graphql(SmsAnalyticsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
