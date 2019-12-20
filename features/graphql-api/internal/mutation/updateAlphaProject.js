/* eslint-env jest */
import './_setup';

const PROJECT_FRAGMENT = /* GraphQL */ `
  fragment Project_informations on Project {
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
      id
      title
      body
      timeless
      enabled
      ... on ConsultationStep {
        consultations {
          totalCount
          edges {
            node {
              id
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
`;

const CreateAlphaProjectMutation = /* GraphQL */ `
  ${PROJECT_FRAGMENT}
  mutation CreateAlphaProject($input: CreateAlphaProjectInput!) {
    createAlphaProject(input: $input) {
      project {
        id
        ...Project_informations
      }
    }
  }
`;

const UpdateAlphaProjectMutation = /* GraphQL */ `
  ${PROJECT_FRAGMENT}
  mutation UpdateAlphaProject($input: UpdateAlphaProjectInput!) {
    updateAlphaProject(input: $input) {
      project {
        id
        ...Project_informations
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

describe('Internal|updateAlphaProject simple mutations', () => {
  it('update a newly created project and add a new PresentationStep', async () => {
    const createResponse = await graphql(
      CreateAlphaProjectMutation,
      {
        input: BASE_PROJECT,
      },
      'internal_admin',
    );
    const projectId = createResponse.createAlphaProject.project.id;

    const updateResponse = await graphql(
      UpdateAlphaProjectMutation,
      {
        input: {
          projectId,
          ...BASE_PROJECT,
          steps: [BASE_PRESENTATION_STEP],
        },
      },
      'internal_admin',
    );
    expect(updateResponse).toMatchSnapshot({
      updateAlphaProject: {
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

  it('update a newly created project and add a new OtherStep', async () => {
    const createResponse = await graphql(
      CreateAlphaProjectMutation,
      {
        input: BASE_PROJECT,
      },
      'internal_admin',
    );
    const projectId = createResponse.createAlphaProject.project.id;

    const updateResponse = await graphql(
      UpdateAlphaProjectMutation,
      {
        input: {
          projectId,
          ...BASE_PROJECT,
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
    );
    expect(updateResponse).toMatchSnapshot({
      updateAlphaProject: {
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

  it('update a newly created project and add a new RankingStep', async () => {
    const createResponse = await graphql(
      CreateAlphaProjectMutation,
      {
        input: BASE_PROJECT,
      },
      'internal_admin',
    );
    const projectId = createResponse.createAlphaProject.project.id;

    const updateResponse = await graphql(
      UpdateAlphaProjectMutation,
      {
        input: {
          projectId,
          ...BASE_PROJECT,
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
    expect(updateResponse).toMatchSnapshot({
      updateAlphaProject: {
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

  it('update a newly created project and add a new ConsultationStep', async () => {
    const createResponse = await graphql(
      CreateAlphaProjectMutation,
      {
        input: BASE_PROJECT,
      },
      'internal_admin',
    );
    const projectId = createResponse.createAlphaProject.project.id;

    const updateResponse = await graphql(
      UpdateAlphaProjectMutation,
      {
        input: {
          projectId,
          ...BASE_PROJECT,
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
    );
    expect(updateResponse).toMatchSnapshot({
      updateAlphaProject: {
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

  it('update a newly created project and add a new CollectStep', async () => {
    const createResponse = await graphql(
      CreateAlphaProjectMutation,
      {
        input: BASE_PROJECT,
      },
      'internal_admin',
    );
    const projectId = createResponse.createAlphaProject.project.id;

    const updateResponse = await graphql(
      UpdateAlphaProjectMutation,
      {
        input: {
          projectId,
          ...BASE_PROJECT,
          steps: [BASE_COLLECT_STEP],
        },
      },
      'internal_admin',
    );
    expect(updateResponse).toMatchSnapshot({
      updateAlphaProject: {
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

  it('update a newly created project and add a new QuestionnaireStep', async () => {
    const createResponse = await graphql(
      CreateAlphaProjectMutation,
      {
        input: BASE_PROJECT,
      },
      'internal_admin',
    );
    const projectId = createResponse.createAlphaProject.project.id;

    const updateResponse = await graphql(
      UpdateAlphaProjectMutation,
      {
        input: {
          projectId,
          ...BASE_PROJECT,
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
    );
    expect(updateResponse).toMatchSnapshot({
      updateAlphaProject: {
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
});

describe('Internal|updateAlphaProject complex mutations', () => {
  it('update a newly created project and add a CollectStep that contains requirements and SelectionStep that contains statuses', async () => {
    const createResponse = await graphql(
      CreateAlphaProjectMutation,
      {
        input: BASE_PROJECT,
      },
      'internal_admin',
    );
    const projectId = createResponse.createAlphaProject.project.id;

    const updateResponse = await graphql(
      UpdateAlphaProjectMutation,
      {
        input: {
          projectId,
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
    expect(updateResponse).toMatchSnapshot({
      updateAlphaProject: {
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

  it('creates a new project with a simple PresentationStep, CollectStep that contains requirements and statuses and SelectionStep that contains statuses and then update the requirements and statuses positions', async () => {
    const createResponse = await graphql(
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
    const {
      project: { id },
    } = createResponse.createAlphaProject;

    const updateResponse = await graphql(
      UpdateAlphaProjectMutation,
      {
        input: {
          projectId: id,
          ...BASE_PROJECT,
          steps: [
            BASE_PRESENTATION_STEP,
            {
              ...BASE_COLLECT_STEP,
              statuses: [
                {
                  name: "Le troisième statut devenu premier de l'étape de dépôt",
                  color: 'warning',
                },
                {
                  name: "Le premier statut devenu deuxième de l'étape de dépôt",
                  color: 'info',
                },
                {
                  name: "Le deuxième statut devenu troisième de l'étape de dépôt",
                  color: 'danger',
                },
              ],
              requirements: [
                {
                  label: "Le deuxième requirement devenu premier de l'étape de dépôt",
                  type: 'CHECKBOX',
                },
                {
                  label: "Le premier requirement devenu deuxième de l'étape de dépôt",
                  type: 'CHECKBOX',
                },
              ],
            },
            {
              ...BASE_SELECTION_STEP,
              statuses: [
                {
                  name: "Le deuxième statut devenu premier de l'étape de sélection",
                  color: 'info',
                },
                {
                  name: "Le premier statut devenu deuxième de l'étape de sélection",
                  color: 'info',
                },
              ],
            },
          ],
        },
      },
      'internal_admin',
    );
    expect(updateResponse).toMatchSnapshot({
      updateAlphaProject: {
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
