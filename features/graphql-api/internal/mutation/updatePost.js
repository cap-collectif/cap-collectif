/* eslint-env jest */
import '../../_setup';

const UpdatePostMutation = /* GraphQL*/ `
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
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
        }
        media {
            id
            url
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
  id: 'UG9zdDpwb3N0MQ==',
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
  media: 'media1',
};

describe('mutations.updatePost', () => {
  it('admin should update a post with required fields.', async () => {
    const response = await graphql(
      UpdatePostMutation,
      {
        input: requiredInput,
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });

  it('admin should update a post with optionnal fields.', async () => {
    const response = await graphql(
      UpdatePostMutation,
      {
        input: optionnalInput,
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });

  it('admin should have an error when submitting an invalid form.', async () => {
    const response = await graphql(
      UpdatePostMutation,
      {
        input: { ...requiredInput, publishedAt: '2020' },
      },
      'internal_admin',
    );

    expect(response.updatePost.post).toBe(null);
    expect(response.updatePost.errorCode).toBe('INVALID_FORM');
  });

  it('admin should have an error when attempting to update a unknown post.', async () => {
    await expect(
      graphql(UpdatePostMutation, { input: { ...requiredInput, id: 'abc' } }, 'internal_admin'),
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('response body should be html_purified to prevent XSS attack.', async () => {
    const response = await graphql(
      UpdatePostMutation,
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

    expect(response.updatePost.post.body).toBe('');
    expect(response.updatePost.errorCode).toBe(null);
  });

  it('should return NOT_AUTHORIZED errorCode if project admin user attempt to update a post that he does not own', async () => {
    await expect(
      graphql(UpdatePostMutation, { input: requiredInput }, 'internal_theo'),
    ).rejects.toThrowError('Access denied to this field.');
  });
});
