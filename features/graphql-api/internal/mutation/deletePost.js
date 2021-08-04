/* eslint-env jest */
import '../../_setup';

const DeletePostMutation = /* GraphQL*/ `
  mutation DeletePost($input: DeletePostInput!) {
    deletePost(input: $input) {
      deletedPostId
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

    expect(response.deletePost.deletedPostId).toBe('UG9zdDpwb3N0MQ==');
  });

  it('should throw an access denied when admin attempt to delete a unknown post.', async () => {
    await expect(
      graphql(DeletePostMutation, { input: { id: 'abc' } }, 'internal_admin'),
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('should throw an access denied when project admin user attempt to delete a post that he does not own', async () => {
    await expect(
      graphql(DeletePostMutation, { input: { id: 'UG9zdDpwb3N0MTQ=' } }, 'internal_theo'),
    ).rejects.toThrowError('Access denied to this field.');
  });
});
