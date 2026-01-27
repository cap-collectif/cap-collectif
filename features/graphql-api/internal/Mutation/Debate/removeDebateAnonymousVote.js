/* eslint-env jest */
import '../../../_setupDB'
import '../../../_setupES'

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
      deletedDebateAnonymousArgumentId
      debate {
        id
        votes {
          totalCount
        }
      }
    }
  }
`

describe('Internal|RemoveDebateAnonymousVote mutation', () => {
  it('should successfully remove an existing anonymous vote when the given hash is valid.', async () => {
    // AGAINST:jesuisunsupertokengenshinimpact1
    const hash = 'QUdBSU5TVDpqZXN1aXN1bnN1cGVydG9rZW5nZW5zaGluaW1wYWN0MQ=='
    const response = await graphql(
      RemoveDebateAnonymousVoteMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateCannabis'),
          hash,
        },
      },
      'internal',
    )
    expect(response).toMatchSnapshot()
  })
  it('should error when the given hash is invalid.', async () => {
    const response = await graphql(
      RemoveDebateAnonymousVoteMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateCannabis'),
          hash: 'YOLO:invalid',
        },
      },
      'internal',
    )
    expect(response).toMatchSnapshot()
  })
  it('should remove an existing anonymous vote and an argument', async () => {
    const hash = 'Rk9SOmRlYmF0ZUFub255bW91c1ZvdGVUb2tlbjEzMDA0'
    const argumentHash = 'Rk9SOmplc3Vpc2xldG9rZW5kdWRlYmF0ZWFub255bW91c2FyZ3VtZW50Zm9yMQ=='
    const response = await graphql(
      RemoveDebateAnonymousVoteMutation,
      {
        input: {
          debateId: toGlobalId('Debate', 'debateCannabis'),
          hash,
          argumentHash,
        },
      },
      'internal',
    )
    expect(response).toMatchSnapshot()
  })
})
