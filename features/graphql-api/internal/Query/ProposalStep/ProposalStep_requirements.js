/* eslint-env jest */

const ProposalStepRequirementsQuery = /* GraphQL */ `
  query ProposalStepRequirementsQuery($proposalStepId: ID!) {
    step: node(id: $proposalStepId) {
      ... on ProposalStep {
        requirements {
          totalCount
          viewerMeetsTheRequirements
          reason
          edges {
            node {
              viewerMeetsTheRequirement
              ... on FirstnameRequirement {
                viewerValue
              }
              ... on DateOfBirthRequirement {
                viewerDateOfBirth
              }
              ... on LastnameRequirement {
                viewerValue
              }
              ... on PhoneRequirement {
                viewerValue
              }
              ... on CheckboxRequirement {
                id
                label
              }
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
describe('Internal|ProposalStep.requirements', () => {
  it('lists requirements and their viewer status', async () => {
    await expect(
      graphql(ProposalStepRequirementsQuery, { proposalStepId: 'collectstepVoteClassement' }, 'internal_user'),
    ).resolves.toMatchSnapshot()
  })
})
