/* eslint-env jest */
import '../../../_setupES'

const ProposalCategoryPreviewData = /* GraphQL */ `
  query ProposalCategoryPreviewData($collectStepId: ID!) {
    node(id: $collectStepId) {
      ... on CollectStep {
        id
        proposals(first: 100) {
          edges {
            node {
              id
              category {
                name
              }
            }
          }
        }
      }
    }
  }
`

describe('Preview.Proposal_category', () => {
  it('fetches category related to a proposal', async () => {
    await expect(
      graphql(
        ProposalCategoryPreviewData,
        {
          collectStepId: toGlobalId('CollectStep', 'collectstep1'),
        },
        'preview',
      ),
    ).resolves.toMatchSnapshot()
  })
})
