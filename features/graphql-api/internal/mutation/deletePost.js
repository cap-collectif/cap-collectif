/* eslint-env jest */
import '../../_setup';

const DeletePostMutation = /* GraphQL*/ `
  mutation DeletePost($input: DeletePostInput!) {
    deletePost(input: $input) {
      errorCode
    }
  }
`;

describe('mutations.deletePost', () => {
  it('admin should delete a post.', async () => {
    const response = await graphql(
      DeletePostMutation,
      {
        input: { id: 'UG9zdDpwb3N0MQ==' },
      },
      'internal_admin',
    );

    expect(response.deletePost.errorCode).toBe(null);
  });

  it('admin should have an error when attempting to delete a unknown post.', async () => {
    const response = await graphql(
      DeletePostMutation,
      {
        input: { id: 'abc' },
      },
      'internal_admin',
    );

    expect(response.deletePost.errorCode).toBe('POST_NOT_FOUND');
  });
});
