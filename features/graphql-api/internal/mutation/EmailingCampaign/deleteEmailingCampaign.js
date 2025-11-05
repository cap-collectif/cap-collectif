/* eslint-env jest */
import '../../../_setup'

const DeleteEmailingCampaignMutation = /* GraphQL */ `
  mutation ($input: DeleteEmailingCampaignsInput!) {
    deleteEmailingCampaigns(input: $input) {
      error
      archivedIds
      deletedIds
    }
  }
`
describe('Internal|DeleteEmailingCampaign', () => {
  it('GraphQL admin deletes a draft campaign and archives a sent campaign', async () => {
    await expect(
      graphql(
        DeleteEmailingCampaignMutation,
        {
          input: {
            ids: [
              'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUmVtaW5kVG9Db25maXJt',
              'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=',
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner deletes its draft campaign', async () => {
    await expect(
      graphql(
        DeleteEmailingCampaignMutation,
        {
          input: {
            ids: ['RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg=='],
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner tries to delete the another person draft campaign', async () => {
    await expect(
      graphql(
        DeleteEmailingCampaignMutation,
        {
          input: {
            ids: ['RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM='],
          },
        },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('GraphQL admin gives wrong id for deleting', async () => {
    await expect(
      graphql(
        DeleteEmailingCampaignMutation,
        {
          input: {
            ids: [
              'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUmVtaW5kVG9Db25maXJt',
              'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=',
              'fail',
            ],
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('GraphQL admin gives no id for deleting', async () => {
    await expect(
      graphql(
        DeleteEmailingCampaignMutation,
        {
          input: {
            ids: [],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
