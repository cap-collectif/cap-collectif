/* eslint-env jest */
import '../../../_setupDB'

const SendEmailingCampaignMutation = /* GraphQL */ `
  mutation ($input: SendEmailingCampaignInput!) {
    sendEmailingCampaign(input: $input) {
      error
      emailingCampaign {
        status
      }
    }
  }
`
describe('Internal|SendEmailingCampaign', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL admin send a draft campaign', async () => {
    await expect(
      graphql(
        SendEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=',
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
  it('GraphQL admin plans a draft campaign', async () => {
    await expect(
      graphql(
        SendEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvVGhhbmtzUmVnaXN0ZXJlZA==',
          },
        },
        'internal_admin',
      ),
    )

    await expect(
      graphql(
        SendEmailingCampaignMutation,
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
  it('GraphQL admin tries send a campaign already sent', async () => {
    await expect(
      graphql(
        SendEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUmVtaW5kVG9Db25maXJt',
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
  it('GraphQL project owner tries to send its draft campaign but is not complete', async () => {
    await expect(
      graphql(
        SendEmailingCampaignMutation,
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
  it('GraphQL project owner tries to send other one campaign', async () => {
    await expect(
      graphql(
        SendEmailingCampaignMutation,
        {
          input: {
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
  it('Organization admin send a draft campaign', async () => {
    await expect(
      graphql(
        SendEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvT3JnYW5pemF0aW9uRHJhZnQ=',
          },
        },
        'internal_valerie',
      ),
    ).resolves.toMatchSnapshot()
  })
})
