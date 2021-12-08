/* eslint-env jest */
import '../../../_setup';

const DeleteAnonymousReplyMutation = /* GraphQL*/ `
    mutation DeleteAnonymousReplyMutation($input: DeleteAnonymousReplyInput!) {
        deleteAnonymousReply(input: $input) {
            questionnaire {
                id
            }
            replyId
        }
    }
`;

describe('mutations.deleteAnonymousReply', () => {
  it('should delete an anonymous reply', async () => {
    const response = await graphql(
      DeleteAnonymousReplyMutation,
      {
        input: {
          hashedToken: 'YWJj', // base 64 encode of replyAnonymous1's token "abc"
        },
      },
      'internal',
    );

    expect(response).toMatchSnapshot();
  });

  it('should throw an error when token is not found', async () => {
    await expect(
      graphql(
        DeleteAnonymousReplyMutation,
        {
          input: {
            hashedToken: 'def',
          },
        },
        'internal',
      ),
    ).rejects.toThrowError('Reply not found');
  });
});
