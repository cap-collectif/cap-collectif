/* eslint-env jest */

const EmailingCampaignNodeQuery = /* GraphQL */ `
  query EmailingCampaignNodeQuery($id: ID!) {
    node(id: $id) {
      ... on EmailingCampaign {
        id
        name
      }
    }
  }
`

// Owned by userTheo
const PROJECT_OWNER_CAMPAIGN_ID = 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvUHJvamVjdFdpdGhPd25lcg=='
// Without owner: only admins can read it
const ADMIN_CAMPAIGN_ID = 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvVGhhbmtzUmVnaXN0ZXJlZA=='
// Owned by organization2, of which Valérie Masson-Delmotte is a member
const ORGANIZATION_CAMPAIGN_ID = 'RW1haWxpbmdDYW1wYWlnbjpDYW1wYWlnblRvT3JnYW5pemF0aW9uRHJhZnQ='

describe('Internal|EmailingCampaign node', () => {
  /**
   * @jest-status compliant
   * @jest-reason Checks explicit values returned by the real GraphQL API for a controlled identity.
   */
  it('lets an admin read a campaign owned by someone else', async () => {
    const response = await graphql(EmailingCampaignNodeQuery, { id: PROJECT_OWNER_CAMPAIGN_ID }, 'internal_admin')

    expect(response.node).toEqual({ id: PROJECT_OWNER_CAMPAIGN_ID, name: expect.any(String) })
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks explicit values returned by the real GraphQL API for a controlled identity.
   */
  it('lets the owner read its campaign', async () => {
    const response = await graphql(EmailingCampaignNodeQuery, { id: PROJECT_OWNER_CAMPAIGN_ID }, 'internal_theo')

    expect(response.node).toEqual({ id: PROJECT_OWNER_CAMPAIGN_ID, name: expect.any(String) })
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks explicit values returned by the real GraphQL API for a controlled identity.
   */
  it('lets a member of the owning organization read its campaign', async () => {
    const response = await graphql(EmailingCampaignNodeQuery, { id: ORGANIZATION_CAMPAIGN_ID }, 'internal_valerie')

    expect(response.node).toEqual({ id: ORGANIZATION_CAMPAIGN_ID, name: expect.any(String) })
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an explicit refusal from the real GraphQL API for a controlled identity.
   */
  it('hides a campaign from a user who is neither its owner nor an admin', async () => {
    const response = await graphql(EmailingCampaignNodeQuery, { id: ADMIN_CAMPAIGN_ID }, 'internal_theo')

    expect(response.node).toBeNull()
  })
})
