/* eslint-env jest */
import '../../../_setup';

// TODO: when https://github.com/cap-collectif/platform/pull/12175 will be merged, the debate votes
// count should reflect the change because we'll add both of the anonymous votes and the
// logged in votes in the `votes` connection. Actually, it only counts the `DebateVote` entity, because
// it is fetched from MySQL
// https://github.com/cap-collectif/platform/blob/d80af609cb88225195fd43347461a6445129c9c2/src/Capco/AppBundle/GraphQL/Resolver/Debate/DebateVotesResolver.php#L39-L42

const RemoveDebateAnonymousVoteMutation = /* GraphQL */ `
  mutation RemoveDebateAnonymousVoteMutation($input: RemoveDebateAnonymousVoteInput!) {
    removeDebateAnonymousVote(input: $input) {
      errorCode
      deletedDebateAnonymousVoteId
      debate {
        id
        votes {
          totalCount
        }
      }
    }
  }
`;

describe('Internal|RemoveDebateAnonymousVote mutation', () => {
  it('should successfully remove an existing anonymous vote when the given hash is valid.', async () => {
    // AGAINST:jesuisunsupertokengenshinimpact1
    const hash = 'QUdBSU5TVDpqZXN1aXN1bnN1cGVydG9rZW5nZW5zaGluaW1wYWN0MQ==';
    const response = await graphql(
      RemoveDebateAnonymousVoteMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateCannabis'),
          hash,
        },
      },
      'internal',
    );
    expect(response).toMatchSnapshot();
  });
  it('should error when the given hash is valid.', async () => {
    const response = await graphql(
      RemoveDebateAnonymousVoteMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateCannabis'),
          hash: 'YOLO:invalid',
        },
      },
      'internal',
    );
    expect(response).toMatchSnapshot();
  });
});
