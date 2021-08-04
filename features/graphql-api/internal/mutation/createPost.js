/* eslint-env jest */
import '../../_setup';

const CreatePostMutation = /* GraphQL*/ `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      post {
        title
        abstract
        body
        metaDescription
        displayedOnBlog
        publishedAt
        isPublished
        commentable
        authors {
          id
          username
        }
        owner {
          id
          username
        }
        relatedContent {
          __typename
          ... on Project {
            title
            id
          }
          ... on Proposal {
            title
            id
          }
          ... on Theme {
            title
            id
          }
        }
      }
      errorCode
    }
  }
`;

const translation = {
  title: 'Titre !',
  body: '<p>Mon article</p>',
  locale: 'fr-FR',
};

const requiredInput = {
  translations: [translation],
  displayedOnBlog: true,
  publishedAt: '2020-06-05 12:15:30',
  isPublished: true,
  commentable: true,
  authors: ['VXNlcjp1c2VyVGhlbw=='],
  projects: [],
  proposals: [],
  themes: [],
};

const optionnalInput = {
  ...requiredInput,
  translations: [
    {
      ...translation,
      abstract: 'résumé',
      metaDescription: 'meta description',
    },
  ],
  projects: ['UHJvamVjdDpwcm9qZWN0SWRmMw==', 'UHJvamVjdDpwcm9qZWN0Rm9vZA=='],
  proposals: ['UHJvcG9zYWw6cHJvcG9zYWwx', 'UHJvcG9zYWw6cHJvcG9zYWwxMDg='],
  themes: ['theme4'],
};

describe('mutations.createPost', () => {
  it('admin should create a post with required fields.', async () => {
    const response = await graphql(
      CreatePostMutation,
      {
        input: requiredInput,
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });

  it('admin should create a post with optionnal fields.', async () => {
    const response = await graphql(
      CreatePostMutation,
      {
        input: optionnalInput,
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });

  it('admin should have an error when submitting an invalid form.', async () => {
    const response = await graphql(
      CreatePostMutation,
      {
        input: { ...requiredInput, publishedAt: '2020' },
      },
      'internal_admin',
    );

    expect(response.createPost.post).toBe(null);
    expect(response.createPost.errorCode).toBe('INVALID_FORM');
  });

  it('response body should be html_purified to prevent XSS attack.', async () => {
    const response = await graphql(
      CreatePostMutation,
      {
        input: {
          ...requiredInput,
          translations: [
            {
              title: 'Titre !',
              body: "<body onload=alert('test1')>",
              locale: 'fr-FR',
            },
          ],
        },
      },
      'internal_admin',
    );

    expect(response.createPost.post.body).toBe('');
    expect(response.createPost.errorCode).toBe(null);
  });

  it('authors should be set to project admin when project admin user create a post', async () => {
    const response = await graphql(
      CreatePostMutation,
      {
        input: requiredInput,
      },
      'internal_theo',
    );

    expect(response.createPost.post.authors[0].id).toBe('VXNlcjp1c2VyVGhlbw==');
    expect(response.createPost.post.authors[0].username).toBe('Théo QP');

    expect(response.createPost.post.owner.id).toBe('VXNlcjp1c2VyVGhlbw==');
    expect(response.createPost.post.owner.username).toBe('Théo QP');
  });
});
