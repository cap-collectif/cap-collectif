/* eslint-env jest */
import '../../_setupDB'

const mutation = /* GraphQL */ `
  mutation ReportMutation($input: ReportInput!) {
    report(input: $input) {
      report {
        body
        type
      }
    }
  }
`

const input = {
  reportableId: 'Q29tbWVudDpwcm9wb3NhbENvbW1lbnQx',
  body: 'je suis un spammeur',
  type: 'SPAM',
}

describe('Internal|report', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
  it('reports a comment as an administrator', async () => {
    const response = await graphql(mutation, { input }, 'internal_admin')

    expect(response.report.report).toEqual({ body: 'je suis un spammeur', type: 'SPAM' })
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('rejects anonymous reports', async () => {
    await expect(graphql(mutation, { input }, 'internal')).rejects.toThrowError('Access denied to this field.')
  })
})
