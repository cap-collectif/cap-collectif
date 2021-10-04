/* eslint-env jest */
import '../../_setup';

const CreateAlphaProjectGroupMutation = /* GraphQL */ `
  mutation CreateAlphaProject($input: CreateAlphaProjectInput!) {
    createAlphaProject(input: $input) {
      project {
        id
        restrictedViewers {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`;

const CreateAlphaProjectMutation = /* GraphQL */ `
  mutation CreateAlphaProject($input: CreateAlphaProjectInput!) {
    createAlphaProject(input: $input) {
      project {
        id
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
        restrictedViewers {
          edges {
            node {
              id
            }
          }
        }
        districts {
          edges {
            node {
              id
            }
          }
        }
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
          id
          title
          body
          timeless
          enabled
          ... on DebateStep {
            debate {
              id
              articles {
                totalCount
                edges {
                  node {
                    id
                    url
                  }
                }
              }
            }
          }
          ... on ConsultationStep {
            consultations {
              totalCount
              edges {
                node {
                  title
                }
              }
            }
          }
          ... on CollectStep {
            private
            form {
              title
            }
          }
          ... on ProposalStep {
            requirements {
              totalCount
              edges {
                node {
                  __typename
                  id
                  ... on CheckboxRequirement {
                    label
                  }
                }
              }
            }
            statuses {
              id
              name
              color
            }
            defaultSort
          }
          ... on QuestionnaireStep {
            questionnaire {
              id
              title
            }
          }
        }
      }
    }
  }
`;

const CreateAlphaProjectWithOwnerMutation = /* GraphQL */ `
  mutation CreateAlphaProject($input: CreateAlphaProjectInput!) {
    createAlphaProject(input: $input) {
      project {
        id
        title
        authors {
          username
        }
        owner {
          username
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
  metaDescription: 'Je suis la super meta',
  visibility: 'PUBLIC',
  themes: ['theme3'],
  isExternal: false,
  publishedAt: '2019-03-01 12:00:00',
  opinionCanBeFollowed: true,
  steps: [],
  districts: [],
  coverFilterOpacityPercent: 60,
  headerType: 'FULL_WIDTH',
  archived: false,
};

const BASE_SELECTION_STEP = {
  type: 'SELECTION',
  body: "Le beau body de l'étape SelectionStep",
  requirements: [],
  statuses: [],
  voteType: 'DISABLED',
  defaultSort: 'RANDOM',
  timeless: false,
  isEnabled: true,
  title: "Le beau titre de l'étape SelectionStep",
  label: 'SelectionStep',
  mainView: 'grid',
};

const BASE_DEBATE_STEP = {
  type: 'DEBATE',
  body: "Le beau body de l'étape DebateStep",
  requirements: [],
  articles: [],
  timeless: true,
  isEnabled: true,
  title: "Le beau titre de l'étape DebateStep",
  label: 'DebateStep',
  debateType: 'FACE_TO_FACE',
  debateContent: '',
};

const BASE_PRESENTATION_STEP = {
  type: 'PRESENTATION',
  body: "Le beau body de l'étape PresentationStep",
  requirements: [],
  isEnabled: true,
  title: "Le beau titre de l'étape PresentationStep",
  label: 'PresentationStep',
};

const BASE_COLLECT_STEP = {
  type: 'COLLECT',
  body: "Le beau body de l'étape CollectStep",
  requirements: [],
  statuses: [],
  voteType: 'DISABLED',
  defaultSort: 'RANDOM',
  private: false,
  proposalForm: 'proposalform13',
  timeless: false,
  isEnabled: true,
  title: "Le beau titre de l'étape CollectStep",
  label: 'CollectStep',
  mainView: 'grid',
};

describe('Internal|createAlphaProject simple mutations', () => {
  it('create a project without any steps', async () => {
    await expect(
      graphql(
        CreateAlphaProjectMutation,
        {
          input: BASE_PROJECT,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
        },
      },
    });
  });

  it('create a project without any steps and with 3 districts', async () => {
    await expect(
      graphql(
        CreateAlphaProjectMutation,
        {
          input: {
            ...BASE_PROJECT,
            districts: ['projectDistrict2', 'projectDistrict3', 'projectDistrict4'],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          districts: {
            edges: [
              {
                node: {
                  id: 'projectDistrict2',
                },
              },
              {
                node: {
                  id: 'projectDistrict3',
                },
              },
              {
                node: {
                  id: 'projectDistrict4',
                },
              },
            ],
          },
        },
      },
    });
  });

  it('create a project with only an "OtherStep" step', async () => {
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
                isEnabled: true,
                title: "Le beau titre de l'étape OtherStep",
                label: 'OtherStep',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          steps: [
            {
              id: expect.any(String),
            },
          ],
        },
      },
    });
  });

  it('create a project with only an "PresentationStep" step', async () => {
    await expect(
      graphql(
        CreateAlphaProjectMutation,
        {
          input: {
            ...BASE_PROJECT,
            title: 'Je suis un projet simple avec une étape de présentation',
            steps: [BASE_PRESENTATION_STEP],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          steps: [
            {
              id: expect.any(String),
            },
          ],
        },
      },
    });
  });

  it('create a project with only an "RankingStep" step', async () => {
    await expect(
      graphql(
        CreateAlphaProjectMutation,
        {
          input: {
            ...BASE_PROJECT,
            projectType: '4',
            title: 'Je suis un projet simple avec une étape de classement',
            steps: [
              {
                type: 'RANKING',
                body: "Le beau body de l'étape RankingStep",
                requirements: [],
                isEnabled: true,
                title: "Le beau titre de l'étape RankingStep",
                label: 'RankingStep',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          steps: [
            {
              id: expect.any(String),
            },
          ],
        },
      },
    });
  });

  it('create a project with only a "ConsultationStep" step', async () => {
    await expect(
      graphql(
        CreateAlphaProjectMutation,
        {
          input: {
            ...BASE_PROJECT,
            projectType: '2',
            title: 'Je suis un projet simple avec une étape de consultation',
            steps: [
              {
                type: 'CONSULTATION',
                body: "Le beau body de l'étape ConsultationStep",
                requirements: [],
                consultations: [],
                timeless: false,
                isEnabled: true,
                title: "Le beau titre de l'étape ConsultationStep",
                label: 'ConsultationStep',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          steps: [
            {
              id: expect.any(String),
            },
          ],
        },
      },
    });
  });

  it('create a project with only a "CollectStep" step', async () => {
    await expect(
      graphql(
        CreateAlphaProjectMutation,
        {
          input: {
            ...BASE_PROJECT,
            projectType: '4',
            title: 'Je suis un projet simple avec une étape de dépôt',
            steps: [BASE_COLLECT_STEP],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          steps: [
            {
              id: expect.any(String),
            },
          ],
        },
      },
    });
  });

  it('create a project with only a "SelectionStep" step', async () => {
    await expect(
      graphql(
        CreateAlphaProjectMutation,
        {
          input: {
            ...BASE_PROJECT,
            projectType: '4',
            title: 'Je suis un projet simple avec une étape de sélection',
            steps: [BASE_SELECTION_STEP],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          steps: [
            {
              id: expect.any(String),
            },
          ],
        },
      },
    });
  });

  it('create a project with only a "QuestionnaireStep" step', async () => {
    await expect(
      graphql(
        CreateAlphaProjectMutation,
        {
          input: {
            ...BASE_PROJECT,
            projectType: '7',
            title: 'Je suis un projet simple avec une étape de questionnaire',
            steps: [
              {
                type: 'QUESTIONNAIRE',
                body: "Le beau body de l'étape QuestionnaireStep",
                requirements: [],
                questionnaire: 'questionnaire1',
                isEnabled: true,
                title: "Le beau titre de l'étape QuestionnaireStep",
                label: 'QuestionnaireStep',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          steps: [
            {
              id: expect.any(String),
            },
          ],
        },
      },
    });
  });

  it('create a project with only a "RankingStep" step', async () => {
    const query = graphql(
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
              isEnabled: true,
              title: "Le beau titre de l'étape RankingStep",
              label: 'RankingStep',
            },
          ],
        },
      },
      'internal_admin',
    );
    await expect(query).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          steps: [
            {
              id: expect.any(String),
            },
          ],
        },
      },
    });
  });

  it('create a project with only a "DebateStep" step', async () => {
    const query = graphql(
      CreateAlphaProjectMutation,
      {
        input: {
          ...BASE_PROJECT,
          title: 'Je suis un projet simple avec une étape de débat',
          steps: [BASE_DEBATE_STEP],
        },
      },
      'internal_admin',
    );
    await expect(query).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          steps: [
            {
              id: expect.any(String),
              debate: {
                id: expect.any(String),
              },
            },
          ],
        },
      },
    });
  });

  it('create a project with only a "DebateStep" step with articles', async () => {
    const query = graphql(
      CreateAlphaProjectMutation,
      {
        input: {
          ...BASE_PROJECT,
          title: 'Je suis un projet simple avec une étape de débat',
          steps: [
            {
              ...BASE_DEBATE_STEP,
              articles: [
                {
                  url: 'https://www.genshin-impact.fr/',
                },
                {
                  url: 'https://myanimelist.net/anime/16498/Shingeki_no_Kyojin',
                },
              ],
            },
          ],
        },
      },
      'internal_admin',
    );
    await expect(query).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          steps: [
            {
              id: expect.any(String),
              debate: {
                id: expect.any(String),
                articles: {
                  edges: [
                    {
                      node: {
                        id: expect.any(String),
                      },
                    },
                    {
                      node: {
                        id: expect.any(String),
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    });
  });
});

describe('Internal|createAlphaProject complex mutations', () => {
  it('create a project with a CollectStep that contains requirements and SelectionStep that contains statuses', async () => {
    const query = graphql(
      CreateAlphaProjectMutation,
      {
        input: {
          ...BASE_PROJECT,
          steps: [
            {
              ...BASE_COLLECT_STEP,
              requirements: [
                {
                  label: "Le premier requirement de l'étape de dépôt",
                  type: 'CHECKBOX',
                },
                {
                  label: "Le deuxième requirement de l'étape de dépôt",
                  type: 'CHECKBOX',
                },
              ],
            },
            {
              ...BASE_SELECTION_STEP,
              statuses: [
                {
                  name: "Le premier statut de l'étape de sélection",
                  color: 'INFO',
                },
                {
                  name: "Le deuxième statut de l'étape de sélection",
                  color: 'INFO',
                },
              ],
            },
          ],
        },
      },
      'internal_admin',
    );
    await expect(query).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          steps: [
            {
              id: expect.any(String),
              requirements: {
                edges: [...Array(2)].map(_ => ({
                  node: {
                    id: expect.any(String),
                  },
                })),
              },
            },
            {
              id: expect.any(String),
              statuses: [...Array(2)].map(_ => ({
                id: expect.any(String),
              })),
            },
          ],
        },
      },
    });
  });

  it('create a project with a simple PresentationStep, CollectStep that contains requirements and statuses and SelectionStep that contains statuses', async () => {
    const query = graphql(
      CreateAlphaProjectMutation,
      {
        input: {
          ...BASE_PROJECT,
          steps: [
            BASE_PRESENTATION_STEP,
            {
              ...BASE_COLLECT_STEP,
              statuses: [
                {
                  name: "Le premier statut de l'étape de dépôt",
                  color: 'INFO',
                },
                {
                  name: "Le deuxième statut de l'étape de dépôt",
                  color: 'DANGER',
                },
                {
                  name: "Le troisième statut de l'étape de dépôt",
                  color: 'WARNING',
                },
              ],
              requirements: [
                {
                  label: "Le premier requirement de l'étape de dépôt",
                  type: 'CHECKBOX',
                },
                {
                  label: "Le deuxième requirement de l'étape de dépôt",
                  type: 'CHECKBOX',
                },
              ],
            },
            {
              ...BASE_SELECTION_STEP,
              statuses: [
                {
                  name: "Le premier statut de l'étape de sélection",
                  color: 'INFO',
                },
                {
                  name: "Le deuxième statut de l'étape de sélection",
                  color: 'INFO',
                },
              ],
            },
          ],
        },
      },
      'internal_admin',
    );
    await expect(query).resolves.toMatchSnapshot({
      createAlphaProject: {
        project: {
          id: expect.any(String),
          steps: [
            {
              id: expect.any(String),
            },
            {
              id: expect.any(String),
              statuses: [...Array(3)].map(_ => ({
                id: expect.any(String),
              })),
              requirements: {
                edges: [...Array(2)].map(_ => ({
                  node: {
                    id: expect.any(String),
                  },
                })),
              },
            },
            {
              id: expect.any(String),
              statuses: [...Array(2)].map(_ => ({
                id: expect.any(String),
              })),
            },
          ],
        },
      },
    });
  });
});

it('create a project with group of users as visibility', async () => {
  const query = graphql(
    CreateAlphaProjectGroupMutation,
    {
      input: {
        ...BASE_PROJECT,
        visibility: 'CUSTOM',
        title: 'Je suis un projet simple avec des groupes de users',
        restrictedViewerGroups: ['group1', 'group5', 'group6'],
      },
    },
    'internal_admin',
  );
  await expect(query).resolves.toMatchSnapshot({
    createAlphaProject: {
      project: {
        id: expect.any(String),
        restrictedViewers: {
          edges: [...Array(3)].map(_ => ({
            node: {
              id: expect.any(String),
            },
          })),
        },
      },
    },
  });
});

describe('access control', () => {
  it('should create a project when the user is a project admin', async () => {
    const response = await graphql(
      CreateAlphaProjectWithOwnerMutation,
      { input: { ...BASE_PROJECT } },
      'internal_theo',
    );
    expect(response.createAlphaProject.project.owner.username).toStrictEqual('Théo QP');
  });

  it('should create a project when the user is a project admin and should be the author', async () => {
    const response = await graphql(
      CreateAlphaProjectWithOwnerMutation,
      { input: { ...BASE_PROJECT } },
      'internal_theo',
    );
    expect(response.createAlphaProject.project.authors).toStrictEqual([{ username: 'Théo QP' }]);
  });

  it('should not create a project when user is a not a project admin', async () => {
    await expect(
      graphql(CreateAlphaProjectWithOwnerMutation, { input: { ...BASE_PROJECT } }, 'internal_user'),
    ).rejects.toThrowError('Access denied to this field.');
  });
});
