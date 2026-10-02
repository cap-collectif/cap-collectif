/* eslint-env jest */
import '../../../_setupDB'

const DeleteOrganization = /* GraphQL*/ `
  mutation DeleteOrganization($input: DeleteOrganizationInput!) {
    deleteOrganization(input: $input) {
      deletedOrganization {
        title
        slug
        body
        banner {
          url
        }
        logo {
          url
        }
        members {
          edges {
            node {
              user {
                username
              }
            }
          }
        }
        socialNetworks {
          webPageUrl
          facebookUrl
          twitterUrl
          youtubeUrl
          linkedInUrl
          instagramUrl
        }
        projects {
          edges {
            node {
              title
              archived
              visibility
            }
          }
        }
        pendingOrganizationInvitations {
          totalCount
        }
      }
      errorCode
    }
  }
`

const input = {
  organizationId: global.toGlobalId('Organization', 'organization2'),
}

describe('mutations.updateOrganization', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('admin should be able to delete organization and organization should be anonymized', async () => {
    const response = await graphql(DeleteOrganization, { input }, 'internal_admin')
    expect(response).toMatchSnapshot()
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('admin organization should not be able to delete organization', async () => {
    await expect(graphql(DeleteOrganization, { input }, 'internal_valerie')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should return ORGANIZATION_NOT_FOUND errorCode', async () => {
    const response = await graphql(
      DeleteOrganization,
      {
        input: {
          organizationId: 'abc',
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should return ORGANIZATION_ALREADY_ANONYMIZED errorCode', async () => {
    const response = await graphql(
      DeleteOrganization,
      {
        input: {
          organizationId: toGlobalId('Organization', 'organizationDeleted'),
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
})
