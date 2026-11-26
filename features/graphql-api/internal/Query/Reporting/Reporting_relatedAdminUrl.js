/* eslint-env jest */

const ReportingRelatedAdminUrlQuery = /* GraphQL */ `
  query ReportingRelatedAdminUrlQuery($id: ID!) {
    reporting(id: $id) {
      id
      url
      relatedAdminUrl
    }
  }
`

const CommentReportingsRelatedAdminUrlQuery = /* GraphQL */ `
  query CommentReportingsRelatedAdminUrlQuery($commentId: ID!) {
    comment: node(id: $commentId) {
      ... on Comment {
        reportings {
          edges {
            node {
              relatedAdminUrl
            }
          }
        }
      }
    }
  }
`

// Reportings of fixtures/Dev/Reporting.yaml, by reported contribution
const PROPOSAL_REPORTING_ID = '2'
const EVENT_COMMENT_REPORTING_ID = '6'
const DEBATE_ARGUMENT_REPORTING_ID = '7'

/**
 * @jest-status compliant
 * @jest-reason Checks explicit results and refusals from the real GraphQL read contract using stable fixture data.
 */
describe('Internal|Reporting.relatedAdminUrl', () => {
  it('links a reported comment to its own back office page, not to the commented event', async () => {
    const { reporting } = await graphql(
      ReportingRelatedAdminUrlQuery,
      { id: EVENT_COMMENT_REPORTING_ID },
      'internal_admin',
    )

    expect(new URL(reporting.relatedAdminUrl).pathname).toBe('/admin/capco/app/comment/eventComment1/edit')
    // The public URL of the contribution is kept for the other consumers of Reporting.url
    expect(reporting.url).not.toContain('/admin/')
  })

  it('links a reported proposal to its back office edit page', async () => {
    const { reporting } = await graphql(ReportingRelatedAdminUrlQuery, { id: PROPOSAL_REPORTING_ID }, 'internal_admin')

    expect(new URL(reporting.relatedAdminUrl).pathname).toBe('/admin/capco/app/proposal/proposal1/edit')
  })

  it('returns null for a reported debate argument, which has no back office page', async () => {
    const { reporting } = await graphql(
      ReportingRelatedAdminUrlQuery,
      { id: DEBATE_ARGUMENT_REPORTING_ID },
      'internal_admin',
    )

    expect(reporting.relatedAdminUrl).toBeNull()
  })

  it('denies access as regular user', async () => {
    const response = await rawInternalGraphql(
      CommentReportingsRelatedAdminUrlQuery,
      { commentId: toGlobalId('Comment', 'eventComment1') },
      { email: 'user@test.com', password: 'user' },
    )

    expect(response.data.comment.reportings.edges[0].node.relatedAdminUrl).toBeNull()
    expect(response.extensions.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Access denied to this field.',
          path: ['comment', 'reportings', 'edges', 0, 'node', 'relatedAdminUrl'],
        }),
      ]),
    )
  })
})
