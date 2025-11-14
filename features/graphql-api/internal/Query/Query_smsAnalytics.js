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

describe('Internal|Query.smsAnalytics', () => {
  it('should query sms analytics', async () => {
    await expect(graphql(SmsAnalyticsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
