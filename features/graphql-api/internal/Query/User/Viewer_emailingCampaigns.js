/* eslint-env jest */

const ViewerEmailingCampaignsQuery = /* GraphQL */ `
  query ViewerEmailingCampaignsQuery(
    $affiliations: [EmailingCampaignAffiliation!]
    $term: String
    $status: EmailingCampaignStatusFilter
    $orderBy: EmailingCampaignOrder
  ) {
    viewer {
      emailingCampaigns(affiliations: $affiliations, term: $term, status: $status, orderBy: $orderBy) {
        totalCount
        edges {
          node {
            owner {
              username
            }
            senderEmail
            senderName
            object
            content
            unlayerConf
            status
            mailingInternal
            mailingList {
              name
            }
            project {
              title
            }
          }
        }
      }
    }
  }
`

describe('Internal.viewer.emailingCampaigns', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should get a project owner campaigns', async () => {
    await expect(
      graphql(ViewerEmailingCampaignsQuery, { affiliations: ['OWNER'] }, 'internal_theo'),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable
   * fixture data.
   */
  it('should thrown an error if a non-admin tries to get all campaigns', async () => {
    await expect(graphql(ViewerEmailingCampaignsQuery, { affiliations: [] }, 'internal_theo')).rejects.toThrowError(
      'cannot request without affiliation',
    )
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should get an admin own campaigns', async () => {
    await expect(
      graphql(ViewerEmailingCampaignsQuery, { affiliations: ['OWNER'] }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should get only PLANNED campaigns as admin', async () => {
    await expect(
      graphql(ViewerEmailingCampaignsQuery, { status: 'PLANNED' }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should get campaigns ordered by sent date ascending', async () => {
    await expect(
      graphql(ViewerEmailingCampaignsQuery, { orderBy: { field: 'SEND_AT', direction: 'ASC' } }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should get all campains as admin', async () => {
    await expect(
      graphql(ViewerEmailingCampaignsQuery, { affiliations: [] }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should search campaigns', async () => {
    await expect(graphql(ViewerEmailingCampaignsQuery, { term: 'COVID' }, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
