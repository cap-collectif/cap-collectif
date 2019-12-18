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
          enabled
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
                  ... on CheckboxRequirement {
                    label
                  }
                }
              }
            }
            statuses {
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

const BASE_PROJECT = {
  title: 'Je suis un projet simple',
  Cover: 'media1',
  video: 'https://www.youtube.com/watch?v=pjJ2w1FX_Wg',
  authors: ['VXNlcjp1c2VyQWRtaW4=', 'VXNlcjp1c2VyMQ=='],
  opinionTerm: 2,
  metaDescription: 'Je suis la super meta',
  visibility: 'PUBLIC',
  themes: ['theme3'],
  isExternal: false,
  publishedAt: '2019-03-01 12:00:00',
  opinionCanBeFollowed: true,
  steps: [],
};

const BASE_SELECTION_STEP = {
  type: 'SELECTION',
  body: "Le beau body de l'étape SelectionStep",
  requirements: [],
  statuses: [],
  voteType: 'DISABLED',
  defaultSort: 'RANDOM',
  proposalsHidden: false,
  timeless: false,
  isEnabled: true,
  title: "Le beau titre de l'étape SelectionStep",
  label: 'SelectionStep',
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
};

describe('Internal|createAlphaProject simple mutation', () => {
  it('create a project without any steps', async () => {
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
    ).resolves.toMatchSnapshot();
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
    ).resolves.toMatchSnapshot();
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
    ).resolves.toMatchSnapshot();
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
    ).resolves.toMatchSnapshot();
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
    ).resolves.toMatchSnapshot();
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
    ).resolves.toMatchSnapshot();
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
    ).resolves.toMatchSnapshot();
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
    await expect(query).resolves.toMatchSnapshot();
    console.log(query.createAlphaProject);
  });
});

describe('Internal|createAlphaProject complex mutation', () => {
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
                  color: 'info',
                },
                {
                  name: "Le deuxième statut de l'étape de sélection",
                  color: 'info',
                },
              ],
            },
          ],
        },
      },
      'internal_admin',
    );
    await expect(query).resolves.toMatchSnapshot();
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
                  color: 'info',
                },
                {
                  name: "Le deuxième statut de l'étape de dépôt",
                  color: 'danger',
                },
                {
                  name: "Le troisième statut de l'étape de dépôt",
                  color: 'warning',
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
                  color: 'info',
                },
                {
                  name: "Le deuxième statut de l'étape de sélection",
                  color: 'info',
                },
              ],
            },
          ],
        },
      },
      'internal_admin',
    );
    await expect(query).resolves.toMatchSnapshot();
  });
});
