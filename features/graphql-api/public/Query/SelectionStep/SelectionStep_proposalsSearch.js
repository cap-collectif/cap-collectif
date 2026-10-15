/* eslint-env jest */
import '../../../_setupESOnce'

const SelectionStepProposalsSearchQuery = /* GraphQL */ `
  query SelectionStepContributorsQuery($id: ID!, $terms: String, $reference: String) {
    selectionStep: node(id: $id) {
      ... on SelectionStep {
        proposals(term: $terms, reference: $reference) {
          edges {
            node {
              id
              title
              media {
                url(format: "reference")
              }
              reference
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
describe('SelectionStep.contributors', () => {
  it('returns proposals filter by proposalTitle and reference', async () => {
    await expect(
      graphql(
        SelectionStepProposalsSearchQuery,
        {
          terms: 'Installation de bancs sur la place de la mairie',
          reference: '1-2',
          id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
        },
        'mediator',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('returns proposals filter by proposalTitle', async () => {
    await expect(
      graphql(
        SelectionStepProposalsSearchQuery,
        {
          terms: 'Installation de bancs sur la place de la mairie',
          id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
        },
        'mediator',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('returns proposals filter by reference', async () => {
    await expect(
      graphql(
        SelectionStepProposalsSearchQuery,
        {
          reference: '1-2',
          id: 'U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25zdGVwMQ==',
        },
        'mediator',
      ),
    ).resolves.toMatchSnapshot()
  })
})
