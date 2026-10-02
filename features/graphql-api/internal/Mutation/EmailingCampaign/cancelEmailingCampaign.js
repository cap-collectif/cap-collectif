/* eslint-env jest */
import '../../../_setupDB'

const CancelEmailingCampaignMutation = /* GraphQL */ `
  mutation ($input: CancelEmailingCampaignInput!) {
    cancelEmailingCampaign(input: $input) {
      error
      emailingCampaign {
        status
      }
    }
  }
`
describe('Internal|CancelEmailingCampaign', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL admin cancel a planned campaign', async () => {
    await expect(
      graphql(
        CancelEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvVGhhbmtzUmVnaXN0ZXJlZA==',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL project owner wants to cancel its campaign, but it is not planned', async () => {
    await expect(
      graphql(
        CancelEmailingCampaignMutation,
        {
          input: {
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
  it('GraphQL project owner wants to cancel another one campaign', async () => {
    await expect(
      graphql(
        CancelEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvVGhhbmtzUmVnaXN0ZXJlZA==',
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
  it('Organization admin cancel a planned campaign', async () => {
    await expect(
      graphql(
        CancelEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvT3JnYW5pemF0aW9uUGxhbm5lZA==',
          },
        },
        'internal_valerie',
      ),
    ).resolves.toMatchSnapshot()
  })
})
