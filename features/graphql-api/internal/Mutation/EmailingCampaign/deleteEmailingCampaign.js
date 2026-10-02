/* eslint-env jest */
import '../../../_setupDB'

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
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
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

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
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

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
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

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
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

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
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
