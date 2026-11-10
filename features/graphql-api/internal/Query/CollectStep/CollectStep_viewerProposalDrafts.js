/* eslint-env jest */
import { execFile } from 'child_process'
import { promisify } from 'util'

const ViewerProposalDraftsQuery = /* GraphQL */ `
  query ViewerProposalDraftsQuery($stepId: ID!) {
    step: node(id: $stepId) {
      ... on CollectStep {
        viewerProposalDrafts {
          edges {
            node {
              title
              url
            }
          }
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|CollectStep.viewerProposalDrafts', () => {
  it('lists the current user draft proposals', async () => {
    await expect(
      graphql(ViewerProposalDraftsQuery, { stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx' }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
})

/**
 * @jest-status compliant
 * @jest-reason Exercises incomplete draft ownership through the real API and restores the fixture in finally.
 */
it('lists incomplete drafts only for their author', async () => {
  const setCompletionStatus = status =>
    promisify(execFile)('docker', [
      'exec',
      '-w',
      '/var/www',
      'capco_application_1',
      'php',
      'bin/console',
      'doctrine:query:sql',
      `UPDATE proposal SET completion_status = '${status}' WHERE id = 'proposal20'`,
      '--env=test',
      '--no-interaction',
    ])
  const query = `query($stepId: ID!) {
    step: node(id: $stepId) { ... on CollectStep {
      viewerProposalDrafts { totalCount edges { node { id } } }
    } }
  }`
  const variables = { stepId: toGlobalId('CollectStep', 'collectstep1') }
  const draftId = toGlobalId('Proposal', 'proposal20')

  try {
    // proposal20 is lbrunet's draft in collectstep1, initially marked COMPLETED.
    await setCompletionStatus('MISSING_REQUIREMENTS')
    const own = await graphql(query, variables, 'internal_super_admin')
    expect(own.step.viewerProposalDrafts).toEqual({ totalCount: 1, edges: [{ node: { id: draftId } }] })

    const other = await graphql(query, variables, 'internal_admin')
    expect(other.step.viewerProposalDrafts.edges.map(({ node }) => node.id)).not.toContain(draftId)
  } finally {
    await setCompletionStatus('COMPLETED')
  }
})
