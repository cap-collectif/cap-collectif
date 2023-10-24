/* eslint-env jest */
const ParticipantReplies = /* GraphQL */ `
  query ParticipantReplies($participantId: ID!) {
    node(id: $participantId) {
      ... on Participant {
        id
        replies {
          totalCount
          edges {
            node {
              adminUrl
              status
              __typename
            }
          }
        }
      }
    }
  }
`;

describe('Internal|Participant.Replies', () => {
  it('super admin should be able to fetch replies from participant', async () => {
    await expect(
      graphql(
        ParticipantReplies,
        {
          participantId: toGlobalId('Participant', 'participant2'),
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
