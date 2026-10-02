/* eslint-env jest */
import '../../../_setupDB'

const leaveOrganization = /* GraphQL */ `
  mutation LeaveOrganization($input: LeaveOrganizationInput!) {
    leaveOrganization(input: $input) {
      organizations {
        id
      }
    }
  }
`

const viewerOrganizations = /* GraphQL */ `
  query ViewerOrganizations {
    viewer {
      organizations {
        id
      }
    }
  }
`

const vmd = { email: 'valerie.massondelmotte@cap-collectif.com', password: 'toto' }

/**
 * @jest-status non-compliant
 * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
 * the database helper runs only before each test.
 */
describe('Internal|leaveOrganization mutation', () => {
  it('removes the member from the organization and from the viewer organizations', async () => {
    const response = await graphql(
      leaveOrganization,
      { input: { organizationId: toGlobalId('Organization', 'organization2') } },
      vmd,
    )

    expect(response.leaveOrganization).toEqual({ organizations: [null] })
    await expect(graphql(viewerOrganizations, {}, vmd)).resolves.toEqual({ viewer: { organizations: [] } })
  })
})
