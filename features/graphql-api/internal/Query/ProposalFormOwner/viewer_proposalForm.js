/* eslint-env jest */

const countViewerProposalFormsQuery = /* GraphQL */ `
  query countViewerProposalForms($availableOnly: Boolean!) {
    viewer {
      proposalForms(affiliations: OWNER, availableOnly: $availableOnly) {
        totalCount
      }
    }
  }
`
const countAllProposalFormsQuery = /* GraphQL */ `
  query countAllProposalForms($availableOnly: Boolean!) {
    viewer {
      proposalForms(availableOnly: $availableOnly) {
        totalCount
      }
    }
  }
`

describe('Internal | viewer_proposalForm', () => {
  it('user get his proposalForms', async () => {
    const response = await graphql(countViewerProposalFormsQuery, { availableOnly: false }, 'internal_user')
    expect(response.viewer.proposalForms.totalCount).toBe(0)
  })
  it('project admin get his proposalForms', async () => {
    const response = await graphql(countViewerProposalFormsQuery, { availableOnly: false }, 'internal_theo')
    expect(response.viewer.proposalForms.totalCount).toBe(3)
  })
  it('project admin get his available proposalForms', async () => {
    const response = await graphql(countViewerProposalFormsQuery, { availableOnly: true }, 'internal_theo')
    expect(response.viewer.proposalForms.totalCount).toBe(1)
  })
  it('project admin cannot get all proposalForms', async () => {
    const response = await graphql(countAllProposalFormsQuery, { availableOnly: false }, 'internal_theo')
    expect(response.viewer.proposalForms.totalCount).toBe(0)
  })
  it('admin get all proposalForms', async () => {
    const response = await graphql(countAllProposalFormsQuery, { availableOnly: false }, 'internal_admin')
    expect(response.viewer.proposalForms.totalCount).toBe(38)
  })
  it('admin get all available proposalForms', async () => {
    const response = await graphql(countAllProposalFormsQuery, { availableOnly: true }, 'internal_admin')
    expect(response.viewer.proposalForms.totalCount).toBe(3)
  })
})
