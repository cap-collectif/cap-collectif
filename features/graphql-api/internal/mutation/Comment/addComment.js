/* eslint-env jest */
import '../../../resetDatabaseBeforeEach'

const AddCommentMutation = /* GraphQL*/ `
    mutation ($input: AddCommentInput!) {
      addComment(input: $input) {
        commentEdge {
          node {
            id
            published
            body
            moderationStatus
            author {
              _id
            }
            authorName
            authorEmail
          }
        }
      }
    }
`

describe('mutations.addCommentMutation', () => {
  it('User wants to add a comment on a proposal', async () => {
    await global.disableFeatureFlag('moderation_comment')

    await expect(
      graphql(
        AddCommentMutation,
        {
          input: {
            commentableId: 'UHJvcG9zYWw6cHJvcG9zYWwx',
            body: 'Tololo',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      addComment: {
        commentEdge: {
          node: {
            id: expect.any(String),
          },
        },
      },
    })
  })

  it('User wants to comment when moderation is enabled', async () => {
    await global.enableFeatureFlag('moderation_comment')

    await expect(
      graphql(
        AddCommentMutation,
        {
          input: {
            commentableId: 'Q29tbWVudDpldmVudENvbW1lbnQx',
            body: 'Ma super réponse',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      addComment: {
        commentEdge: {
          node: {
            id: expect.any(String),
          },
        },
      },
    })
  })

  it('User wants to comment when moderation is disabled', async () => {
    await global.disableFeatureFlag('moderation_comment')

    await expect(
      graphql(
        AddCommentMutation,
        {
          input: {
            commentableId: 'Q29tbWVudDpldmVudENvbW1lbnQx',
            body: 'Ma super réponse',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      addComment: {
        commentEdge: {
          node: {
            id: expect.any(String),
          },
        },
      },
    })
  })

  it('Admin wants to comment', async () => {
    await global.enableFeatureFlag('moderation_comment')

    await expect(
      graphql(
        AddCommentMutation,
        {
          input: {
            commentableId: 'Q29tbWVudDpldmVudENvbW1lbnQx',
            body: 'Ma super réponse',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      addComment: {
        commentEdge: {
          node: {
            id: expect.any(String),
          },
        },
      },
    })
  })
})
