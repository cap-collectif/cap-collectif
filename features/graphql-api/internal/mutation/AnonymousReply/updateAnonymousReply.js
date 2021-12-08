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
  hashedToken: 'YWJj', // base 64 encode of replyAnonymous1's token "abc"
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

  it('should throw an error when token is not found', async () => {
    await expect(
      graphql(
        UpdateAnonymousReplyMutation,
        {
          input: {
            ...input,
            hashedToken: 'def',
          },
        },
        'internal',
      ),
    ).rejects.toThrowError('Reply not found.');
  });
});
