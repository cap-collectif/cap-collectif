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
