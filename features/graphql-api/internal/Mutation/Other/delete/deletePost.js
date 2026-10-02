/* eslint-env jest */
import '../../../../_setupDB'

const DeletePostMutation = /* GraphQL*/ `
  mutation DeletePost($input: DeletePostInput!) {
    deletePost(input: $input) {
      deletedPostId
    }
  }
`

describe('mutations.deletePost', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
  it('admin should delete a post.', async () => {
    const response = await graphql(
      DeletePostMutation,
      {
        input: { id: 'UG9zdDpwb3N0MQ==' },
      },
      'internal_admin',
    )

    expect(response.deletePost.deletedPostId).toBe('UG9zdDpwb3N0MQ==')
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('should throw an access denied when admin attempt to delete a unknown post.', async () => {
    await expect(graphql(DeletePostMutation, { input: { id: 'abc' } }, 'internal_admin')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('should throw an access denied when project admin user attempt to delete a post that he does not own', async () => {
    await expect(
      graphql(DeletePostMutation, { input: { id: 'UG9zdDpwb3N0MTQ=' } }, 'internal_theo'),
    ).rejects.toThrowError('Access denied to this field.')
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
  it('should allow delete if member of organization is also the author of the post', async () => {
    const postId = 'UG9zdDpwb3N0V2l0aE9yZ2FNZW1iZXI='
    const response = await graphql(
      DeletePostMutation,
      {
        input: { id: postId },
      },
      'internal_valerie',
    )
    expect(response.deletePost.deletedPostId).toBe(postId)
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('should throw an access denied when orga member who is not the author attempt to delete the post', async () => {
    await expect(
      graphql(DeletePostMutation, { input: { id: 'UG9zdDpwb3N0MTQ=' } }, 'internal_christophe'),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
