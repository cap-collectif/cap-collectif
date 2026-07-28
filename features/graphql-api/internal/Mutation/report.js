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
  it('reports a comment as an administrator', async () => {
    const response = await graphql(mutation, { input }, 'internal_admin')

    expect(response.report.report).toEqual({ body: 'je suis un spammeur', type: 'SPAM' })
  })

  it('rejects anonymous reports', async () => {
    await expect(graphql(mutation, { input }, 'internal')).rejects.toThrowError('Access denied to this field.')
  })
})
