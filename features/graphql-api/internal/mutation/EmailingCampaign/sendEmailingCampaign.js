/* eslint-env jest */
import '../../../_setup'

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
