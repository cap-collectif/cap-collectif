/* eslint-env jest */
import '../../../_setup'

const UpdateEmailingCampaignMutation = /* GraphQL */ `
  mutation ($input: UpdateEmailingCampaignInput!) {
    updateEmailingCampaign(input: $input) {
      error
      emailingCampaign {
        name
        senderEmail
        senderName
        object
        content
        unlayerConf
        sendAt
        status
        mailingInternal
        mailingList {
          id
        }
        emailingGroup {
          id
        }
      }
    }
  }
`
describe('Internal|UpdateEmailingCampaign', () => {
  it('GraphQL admin updates a campaign', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            object: 'new object',
            content: 'new content',
            sendAt: '2060-01-01 00:00:00',
            mailingInternal: 'REGISTERED',
            unlayerConf: '{"what": "configuration"}',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin updates a campaign with a mailing list', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            mailingList: 'TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin try to update a non existing campaign', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'iDoNotExist',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            object: 'new object',
            content: 'new content',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('GraphQL admin try to update a campaign already sent', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUmVtaW5kVG9Db25maXJt',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            object: 'new object',
            content: 'new content',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin tries to update a campaign with date already past', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            object: 'new object',
            content: 'new content',
            sendAt: '2020-01-01 00:00:00',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin updates a campaign with both an internal list and a mailing list', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            mailingList: 'TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0',
            mailingInternal: 'CONFIRMED',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin updates a campaign with wrong non existing list', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            mailingList: 'jpec',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin updates a campaign with wrong non existing internal list', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            mailingInternal: 'jpec',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner updates its campaign', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg==',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            mailingList: 'TWFpbGluZ0xpc3Q6ZW1wdHlNYWlsaW5nTGlzdFdpdGhPd25lcg==',
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner tries to update other one campaign', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQ292aWRQYXJ0aWNpcGFudHM=',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            mailingList: 'TWFpbGluZ0xpc3Q6ZW1wdHlNYWlsaW5nTGlzdFdpdGhPd25lcg==',
          },
        },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('GraphQL project owner tries to update its campaign with another ones mailing list', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg==',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            mailingList: 'TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0',
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner tries to update its campaign with internal mailing list', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg==',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            mailingInternal: 'NOT_CONFIRMED',
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin tries to update its campaign with group', async () => {
    await expect(
      graphql(
        UpdateEmailingCampaignMutation,
        {
          input: {
            id: 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvQWdlbnREZUxhVmlsbGVQYXJ0aWNpcGFudHM=',
            name: 'new name',
            senderEmail: 'new@cap-collectif.com',
            senderName: 'new sender name',
            emailingGroup: 'R3JvdXA6Z3JvdXAy',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
