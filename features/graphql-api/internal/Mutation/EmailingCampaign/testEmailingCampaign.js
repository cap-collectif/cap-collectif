/* eslint-env jest */
import '../../../_setupDB'

const TestEmailingCampaignMutation = /* GraphQL */ `
  mutation ($input: TestEmailingCampaignInput!) {
    testEmailingCampaign(input: $input) {
      error
      html
    }
  }
`
describe('Internal|TestEmailingCampaign', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL admin tests a campaign', async () => {
    await expect(
      graphql(
        TestEmailingCampaignMutation,
        {
          input: {
            email: 'vincent@cap-collectif.com',
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      testEmailingCampaign: {
        error: null,
        html: expect.any(String),
      },
    })
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL project owner wants to test its campaign but not sendable', async () => {
    await expect(
      graphql(
        TestEmailingCampaignMutation,
        {
          input: {
            email: 'vincent@cap-collectif.com',
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg==',
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('GraphQL project owner wants to test another one campaign', async () => {
    await expect(
      graphql(
        TestEmailingCampaignMutation,
        {
          input: {
            email: 'vincent@cap-collectif.com',
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=',
          },
        },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('Organization admin tests a campaign', async () => {
    await expect(
      graphql(
        TestEmailingCampaignMutation,
        {
          input: {
            email: 'vincent@cap-collectif.com',
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvT3JnYW5pemF0aW9uRHJhZnQ=',
          },
        },
        'internal_valerie',
      ),
    ).resolves.toMatchSnapshot({
      testEmailingCampaign: {
        error: null,
        html: expect.any(String),
      },
    })
  })
})
