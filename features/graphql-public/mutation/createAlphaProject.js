/* eslint-env jest */
const CreateAlphaProjectMutation = /* GraphQL */ `
  mutation CreateAlphaProject($input: CreateAlphaProjectInput!) {
    createAlphaProject(input: $input) {
      project {
        title
        cover {
          id
          name
        }
        video
        authors {
          id
          username
        }
        opinionTerm
        type {
          id
          title
        }
        visibility
        themes {
          id
          title
        }
        isExternal
        publishedAt
        opinionCanBeFollowed
        steps {
          __typename
          title
          body
          timeless
        }
      }
    }
  }
`;

const BASE_PROJECT = {
  title: 'Je suis un projet simple',
  Cover: 'media1',
  video: 'https://www.youtube.com/watch?v=pjJ2w1FX_Wg',
  authors: ['VXNlcjp1c2VyQWRtaW4=', 'VXNlcjp1c2VyMQ=='],
  opinionTerm: 2,
  projectType: '2',
  metaDescription: 'Je suis la super meta',
  visibility: 'PUBLIC',
  themes: ['theme3'],
  isExternal: false,
  publishedAt: '2019-03-01 12:00:00',
  opinionCanBeFollowed: true,
  steps: [],
};

describe('Internal|createAlphaProject mutation', () => {
  it('create a simple project without any steps', async () => {
    await expect(
      graphql(
        CreateAlphaProjectMutation,
        {
          input: BASE_PROJECT,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('create a simple project with only an "OtherStep" step', async () => {
    await expect(
      graphql(
        CreateAlphaProjectMutation,
        {
          input: {
            ...BASE_PROJECT,
            title: 'Je suis un projet simple avec une étape de type autre',
            steps: [
              {
                type: 'OTHER',
                body: "Le beau body de l'étape OtherStep",
                requirements: [],
                isEnabled: false,
                title: "Le beau titre de l'étape OtherStep",
                label: 'OtherStep',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('create a simple project with only an "PresentationStep" step', async () => {
    await expect(
      graphql(
        CreateAlphaProjectMutation,
        {
          input: {
            ...BASE_PROJECT,
            title: 'Je suis un projet simple avec une étape de présentation',
            steps: [
              {
                type: 'PRESENTATION',
                body: "Le beau body de l'étape PresentationStep",
                requirements: [],
                isEnabled: false,
                title: "Le beau titre de l'étape PresentationStep",
                label: 'PresentationStep',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('create a simple project with only an "RankingStep" step', async () => {
    await expect(
      graphql(
        CreateAlphaProjectMutation,
        {
          input: {
            ...BASE_PROJECT,
            title: 'Je suis un projet simple avec une étape de classement',
            steps: [
              {
                type: 'RANKING',
                body: "Le beau body de l'étape RankingStep",
                requirements: [],
                isEnabled: false,
                title: "Le beau titre de l'étape RankingStep",
                label: 'RankingStep',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
