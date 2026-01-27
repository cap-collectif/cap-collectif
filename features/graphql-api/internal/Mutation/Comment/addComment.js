/* eslint-env jest */
import '../../../_setupDB'

const AddCommentMutation = /* GraphQL*/ `
    mutation ($input: AddCommentInput!) {
      addComment(input: $input) {
        commentEdge {
          node {
            id
            published
            body
            parent {
              id
            }
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
    await global.resetFeatureFlags()
  })

  it('User wants to comment when moderation is disabled', async () => {

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
    await global.resetFeatureFlags()
  })

  it('Anonymous wants to add a comment on a blog post', async () => {
    await expect(
      graphql(
        AddCommentMutation,
        {
          input: {
            commentableId: 'UHJvcG9zYWw6cHJvcG9zYWwx',
            body: 'Je suis un super contenu',
            authorName: 'Je suis anonyme',
            authorEmail: 'anonyme@cap-collectif.com',
          },
        },
        'internal',
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

  it('Anonymous wants to add a comment on a blog post when moderation is enabled', async () => {
    await global.enableFeatureFlag('moderation_comment')

    await expect(
      graphql(
        AddCommentMutation,
        {
          input: {
            commentableId: 'UHJvcG9zYWw6cHJvcG9zYWwx',
            body: 'Je suis un super contenu',
            authorName: 'Je suis anonyme',
            authorEmail: 'anonyme@cap-collectif.com',
          },
        },
        'internal',
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
    await global.resetFeatureFlags()
  })

  it('Anonymous wants to add an anwer to a comment', async () => {
    await expect(
      graphql(
        AddCommentMutation,
        {
          input: {
            commentableId: 'Q29tbWVudDpldmVudENvbW1lbnQx',
            authorName: 'Kéké',
            authorEmail: 'vivele94@cap-collectif.com',
            body: 'Ma super réponse',
          },
        },
        'internal',
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
