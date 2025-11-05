/* eslint-env jest */
import '../../../_setup'

const TestEmailingCampaignMutation = /* GraphQL */ `
  mutation ($input: TestEmailingCampaignInput!) {
    testEmailingCampaign(input: $input) {
      error
      html
    }
  }
`
describe('Internal|TestEmailingCampaign', () => {
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
