//* eslint-env jest */
const CollectStepRequirementsParticipantsQuery = /* GraphQL */ `
  query CollectStepRequirementsParticipantsQuery($id: ID!, $token: String!) {
    node(id: $id) {
      id
      ... on CollectStep {
        id
        title
        requirements {
          edges {
            node {
              __typename
              participantMeetsTheRequirement(token: $token)
              ... on FirstnameRequirement {
                participantValue(token: $token)
              }
              ... on LastnameRequirement {
                participantValue(token: $token)
              }
              ... on PhoneRequirement {
                participantValue(token: $token)
              }
              ... on DateOfBirthRequirement {
                participantDateOfBirth(token: $token)
              }
            }
          }
        }
      }
    }
  }
`

describe('Internal|CollectStep.requirements connection', () => {
  it('fetches requirements for a participant', async () => {
    await expect(
      graphql(
        CollectStepRequirementsParticipantsQuery,
        {
          id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBWb3RlQ2xhc3NlbWVudA==',
          token: 'fakeToken1',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
