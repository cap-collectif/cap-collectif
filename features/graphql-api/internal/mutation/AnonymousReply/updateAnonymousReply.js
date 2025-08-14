/* eslint-env jest */
import '../../../_setup';

const UpdateAnonymousReplyMutation = /* GraphQL*/ `
    mutation UpdateAnonymousReplyMutation($input: UpdateAnonymousReplyInput!) {
        updateAnonymousReply(input: $input) {
            reply {
                __typename
                id
                responses {
                    ...on ValueResponse {
                        value
                    }
                }
            }
        }
    }
`;

const input = {
  replyId: toGlobalId('Reply', 'replyAnonymous1'),
  participantToken: btoa('fakeToken1'),
  responses: [
    {
      value: 'updated anonymous reply',
      question: 'UXVlc3Rpb246MTQwMw==',
    },
  ],
};

describe('mutations.updateAnonymousReply', () => {
  it('should update an anonymous reply', async () => {
    const response = await graphql(
      UpdateAnonymousReplyMutation,
      {
        input,
      },
      'internal',
    );

    expect(response).toMatchSnapshot();
  });

  it('should throw an error when participant token is not found', async () => {
    await expect(
      graphql(
        UpdateAnonymousReplyMutation,
        {
          input: {
            ...input,
            participantToken: 'def',
          },
        },
        'internal',
      ),
    ).rejects.toThrowError('Given token does not match corresponding Participant');
  });
});
