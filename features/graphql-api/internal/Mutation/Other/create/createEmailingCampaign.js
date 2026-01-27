/* eslint-env jest */
import '../../../../_setupDB'

const createEmailingCampaignMutation = /* GraphQL */ `
  mutation ($input: CreateEmailingCampaignInput!) {
    createEmailingCampaign(input: $input) {
      error
      emailingCampaign {
        emailingGroup {
          id
        }
        project {
          title
        }
        name
        owner {
          username
        }
        mailingList {
          id
          isDeletable
        }
        mailingInternal
        status
        sendAt
      }
    }
  }
`

describe('Internal|Emailing campaign', () => {
  it('GraphQL project owner creates a campaign', async () => {
    await expect(
      graphql(
        createEmailingCampaignMutation,
        {
          input: {},
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin creates a campaign from an internal list', async () => {
    await expect(
      graphql(
        createEmailingCampaignMutation,
        {
          input: {
            mailingList: 'REGISTERED',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner wants to create a campaign from an internal list', async () => {
    await expect(
      graphql(
        createEmailingCampaignMutation,
        {
          input: {
            mailingList: 'REGISTERED',
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner creates a campaign from its mailing list', async () => {
    await expect(
      graphql(
        createEmailingCampaignMutation,
        {
          input: {
            mailingList: 'TWFpbGluZ0xpc3Q6ZW1wdHlNYWlsaW5nTGlzdFdpdGhPd25lcg==',
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner creates a campaign from other one mailing list', async () => {
    await expect(
      graphql(
        createEmailingCampaignMutation,
        {
          input: {
            mailingList: 'TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0',
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin creates a campaign from a mailing list', async () => {
    await expect(
      graphql(
        createEmailingCampaignMutation,
        {
          input: {
            mailingList: 'TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin creates a campaign from a group', async () => {
    await expect(
      graphql(
        createEmailingCampaignMutation,
        {
          input: {
            emailingGroup: 'R3JvdXA6Z3JvdXAy',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to create a campaign with a wrong mailing list', async () => {
    await expect(
      graphql(
        createEmailingCampaignMutation,
        {
          input: {
            mailingList: 'fail',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner creates a campaign from its project', async () => {
    await expect(
      graphql(
        createEmailingCampaignMutation,
        {
          input: {
            project: 'UHJvamVjdDpwcm9qZWN0V2l0aE93bmVy',
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner creates a campaign from another project and get an error', async () => {
    await expect(
      graphql(
        createEmailingCampaignMutation,
        {
          input: {
            project: 'UHJvamVjdDpwcm9qZWN0MQ==',
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to create a campaign with both group and organic list', async () => {
    await expect(
      graphql(
        createEmailingCampaignMutation,
        {
          input: {
            mailingList: 'TWFpbGluZ0xpc3Q6bWFpbGlnbkxpc3RGcm9tQ292aWRQcm9qZWN0',
            emailingGroup: 'R3JvdXA6Z3JvdXAy',
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })
})
