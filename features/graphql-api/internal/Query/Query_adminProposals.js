/* eslint-env jest */

const AdminProposalsQuery = /* GraphQL */ `
  query AdminProposalsQuery($search: String!) {
    adminProposals(search: $search) {
      totalCount
      edges {
        node {
          id
          reference(full: true)
          lastStatus {
            name
          }
        }
      }
    }
  }
`

describe('Internal|Query.adminProposals', () => {
  // The proposal1 fixture links both the welcomattic user and the JohnDoe participant.
  it.each([
    ['user username', 'welcomattic'],
    ['user email', 'msantostefano@cap-collectif.com'],
    ['participant username', 'JohnDoe'],
    ['participant email', 'participant1@cap-collectif.com'],
  ])('finds proposals by %s', async (_, search) => {
    const { adminProposals } = await graphql(AdminProposalsQuery, { search }, 'internal_admin')

    expect(adminProposals.edges.map(({ node }) => node.id)).toContain(toGlobalId('Proposal', 'proposal1'))
  })

  it('filters and counts proposals by full reference', async () => {
    const { adminProposals } = await graphql(AdminProposalsQuery, { search: '666-666' }, 'internal_admin')

    expect(adminProposals.totalCount).toBe(1)
    expect(adminProposals.edges.map(({ node }) => ({ id: node.id, reference: node.reference }))).toEqual([
      { id: toGlobalId('Proposal', 'proposal22'), reference: '666-666' },
    ])
  })

  it('returns the last assigned status when the final selection has no status', async () => {
    // proposal2 has a status in selectionstep1 and no status in selectionstep2.
    const { adminProposals } = await graphql(AdminProposalsQuery, { search: 'Rénovation du gymnase' }, 'internal_admin')

    const proposal = adminProposals.edges.find(({ node }) => node.id === toGlobalId('Proposal', 'proposal2'))?.node
    expect(proposal?.lastStatus).toEqual({ name: 'Vote gagné' })
  })
})
