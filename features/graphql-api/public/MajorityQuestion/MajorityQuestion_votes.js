/* eslint-env jest */
const MajorityQuestionVotesQuery = /* GraphQL */ `
  query MajorityQuestionVotesQuery($id: ID!) {
    node(id: $id) {
      ... on MajorityQuestion {
        title
        totalVotesCount
        responsesByChoice {
          choice
          count
        }
      }
    }
  }
`;

describe('Internal|MajorityQuestions_votes', () => {
  it('it fetches a majority question with its votesCount and its categories', async () => {
    const id = 'UXVlc3Rpb246MTM4NQ==';
    await expect(
      graphql(
        MajorityQuestionVotesQuery,
        {
          id,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot(id);
  });
});
