/* eslint-env jest */
const ParticipantVotes = /* GraphQL */ `
    query ParticipantVotes($participantId: ID!) {
        node(id: $participantId) {
            ... on Participant {
                id
                votes {
                    totalCount
                    edges {
                        node {
                            id
                            kind
                        }
                    }
                }
            }
        }
    }
`;

describe('Internal|Participant.Votes', () => {
	it('super admin should be able to fetch votes from participant', async () => {
		await expect(
			graphql(
				ParticipantVotes,
				{
					participantId: toGlobalId('Participant', 'participant2'),
				},
				'internal_super_admin',
			),
		).resolves.toMatchSnapshot();
	});
});
