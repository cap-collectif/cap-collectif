/* eslint-env jest */
const ParticipantProposals = /* GraphQL */ `
  query ParticipantReplies($participantId: ID!) {
    node(id: $participantId) {
      ... on Participant {
        id
        firstName
        proposals {
          totalCount
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
  }
`;

describe('Internal|Participant.Proposals', () => {
  it('participant admin should be able to fetch all proposals from participant not attached to a step ', async () => {
    await expect(
      graphql(
        ParticipantProposals,
        {
          participantId: toGlobalId('Participant', 'participant2')
        },
        'internal_super_admin'
      ),
    ).resolves.toMatchSnapshot();
  });
})
