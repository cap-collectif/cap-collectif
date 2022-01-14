/* eslint-env jest */
import '../../_setup';

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
    owner {
      id
      username
      url
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
        votesMin
        votesLimit
        form {
          title
        }
        mainView
      }
      ... on SelectionStep {
        mainView
        votesMin
        votesLimit
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
        isSecretBallot
        publishedVoteDate
        defaultSort
      }
      ... on QuestionnaireStep {
        questionnaire {
          id
          title
        }
      }
      ... on DebateStep {
        debate {
          id
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

const PROJECT_GROUP_FRAGMENT = /* GraphQL */ `
  fragment Project_informations on Project {
    restrictedViewers {
      edges {
        node {
          id
        }
      }
    }
  }
`;

const UpdateAlphaProjectGroupMutation = /* GraphQL */ `
  ${PROJECT_GROUP_FRAGMENT}
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
  metaDescription: 'Je suis la super meta',
  visibility: 'PUBLIC',
  themes: ['theme3'],
  isExternal: false,
  publishedAt: '2019-03-01 12:00:00',
  opinionCanBeFollowed: true,
  steps: [],
  districts: [],
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
  mainView: 'list',
  secretBallot: true,
  publishedVoteDate: '2030-01-01 00:00:00',
};

const BASE_PRESENTATION_STEP = {
  type: 'PRESENTATION',
  body: "Le beau body de l'étape PresentationStep",
  requirements: [],
  isEnabled: true,
  title: "Le beau titre de l'étape PresentationStep",
  label: 'PresentationStep',
};

const BASE_DEBATE_STEP = {
  type: 'DEBATE',
  body: "Le beau body de l'étape DebateStep",
  requirements: [],
  isEnabled: true,
  title: "Le beau titre de l'étape DebateStep",
  label: 'DebateStep',
  debateType: 'FACE_TO_FACE',
  debateContent: '',
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
    expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
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
    expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
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
    expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
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
    expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
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

  it('update a newly created project and add two districts', async () => {
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
          districts: ['projectDistrict2', 'projectDistrict3'],
        },
      },
      'internal_admin',
    );
    expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
    expect(updateResponse).toMatchSnapshot({
      updateAlphaProject: {
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
            ],
          },
        },
      },
    });
  });

  it('update a newly created project and add five districts then remove two', async () => {
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
          districts: [
            'projectDistrict2',
            'projectDistrict3',
            'projectDistrict4',
            'projectDistrict5',
            'projectDistrict6',
          ],
        },
      },
      'internal_admin',
    );
    expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
    expect(updateResponse).toMatchSnapshot({
      updateAlphaProject: {
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
              {
                node: {
                  id: 'projectDistrict5',
                },
              },
              {
                node: {
                  id: 'projectDistrict6',
                },
              },
            ],
          },
        },
      },
    });
    const deleteTwoDistrictsResponse = await graphql(
      UpdateAlphaProjectMutation,
      {
        input: {
          projectId,
          ...BASE_PROJECT,
          districts: ['projectDistrict2', 'projectDistrict4', 'projectDistrict6'],
        },
      },
      'internal_admin',
    );
    expect(deleteTwoDistrictsResponse).toMatchSnapshot({
      updateAlphaProject: {
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
                  id: 'projectDistrict4',
                },
              },
              {
                node: {
                  id: 'projectDistrict6',
                },
              },
            ],
          },
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
    expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
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
    expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
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
    expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
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
    const projectId = createResponse.createAlphaProject.project.id;
    const firstStepId = createResponse.createAlphaProject.project.steps[0].id;

    const secondStepId = createResponse.createAlphaProject.project.steps[1].id;
    const firstStatusSecondStepId =
      createResponse.createAlphaProject.project.steps[1].statuses[0].id;
    const secondStatusSecondStepId =
      createResponse.createAlphaProject.project.steps[1].statuses[1].id;
    const thirdStatusSecondStepId =
      createResponse.createAlphaProject.project.steps[1].statuses[2].id;
    const firstRequirementSecondStepId =
      createResponse.createAlphaProject.project.steps[1].requirements.edges[0].node.id;
    const secondRequirementSecondStepId =
      createResponse.createAlphaProject.project.steps[1].requirements.edges[1].node.id;

    const thirdStepId = createResponse.createAlphaProject.project.steps[2].id;
    const firstStatusThirdStepId =
      createResponse.createAlphaProject.project.steps[2].statuses[0].id;
    const secondStatusThirdStepId =
      createResponse.createAlphaProject.project.steps[2].statuses[1].id;

    const updateResponse = await graphql(
      UpdateAlphaProjectMutation,
      {
        input: {
          projectId,
          ...BASE_PROJECT,
          steps: [
            {
              ...BASE_PRESENTATION_STEP,
              id: firstStepId,
            },
            {
              ...BASE_COLLECT_STEP,
              id: secondStepId,
              statuses: [
                {
                  id: thirdStatusSecondStepId,
                  name: "Le troisième statut devenu premier de l'étape de dépôt",
                  color: 'WARNING',
                },
                {
                  id: firstStatusSecondStepId,
                  name: "Le premier statut devenu deuxième de l'étape de dépôt",
                  color: 'INFO',
                },
                {
                  id: secondStatusSecondStepId,
                  name: "Le deuxième statut devenu troisième de l'étape de dépôt",
                  color: 'DANGER',
                },
              ],
              requirements: [
                {
                  id: secondRequirementSecondStepId,
                  label: "Le deuxième requirement devenu premier de l'étape de dépôt",
                  type: 'CHECKBOX',
                },
                {
                  id: firstRequirementSecondStepId,
                  label: "Le premier requirement devenu deuxième de l'étape de dépôt",
                  type: 'CHECKBOX',
                },
              ],
            },
            {
              ...BASE_SELECTION_STEP,
              id: thirdStepId,
              statuses: [
                {
                  id: secondStatusThirdStepId,
                  name: "Le deuxième statut devenu premier de l'étape de sélection",
                  color: 'INFO',
                },
                {
                  id: firstStatusThirdStepId,
                  name: "Le premier statut devenu deuxième de l'étape de sélection",
                  color: 'INFO',
                },
              ],
            },
          ],
        },
      },
      'internal_admin',
    );
    expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
    expect(updateResponse.updateAlphaProject.project.steps[0].id).toBe(firstStepId);

    expect(updateResponse.updateAlphaProject.project.steps[1].id).toBe(secondStepId);
    expect(updateResponse.updateAlphaProject.project.steps[1].statuses[0].id).toBe(
      thirdStatusSecondStepId,
    );
    expect(updateResponse.updateAlphaProject.project.steps[1].statuses[1].id).toBe(
      firstStatusSecondStepId,
    );
    expect(updateResponse.updateAlphaProject.project.steps[1].statuses[2].id).toBe(
      secondStatusSecondStepId,
    );
    expect(updateResponse.updateAlphaProject.project.steps[1].requirements.edges[0].node.id).toBe(
      secondRequirementSecondStepId,
    );
    expect(updateResponse.updateAlphaProject.project.steps[1].requirements.edges[1].node.id).toBe(
      firstRequirementSecondStepId,
    );

    expect(updateResponse.updateAlphaProject.project.steps[2].id).toBe(thirdStepId);
    expect(updateResponse.updateAlphaProject.project.steps[2].statuses[0].id).toBe(
      secondStatusThirdStepId,
    );
    expect(updateResponse.updateAlphaProject.project.steps[2].statuses[1].id).toBe(
      firstStatusThirdStepId,
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

it('update a newly created project and add a group', async () => {
  const createResponse = await graphql(
    CreateAlphaProjectMutation,
    {
      input: BASE_PROJECT,
    },
    'internal_admin',
  );
  const projectId = createResponse.createAlphaProject.project.id;

  const updateResponse = await graphql(
    UpdateAlphaProjectGroupMutation,
    {
      input: {
        projectId,
        ...BASE_PROJECT,
        visibility: 'CUSTOM',
        restrictedViewerGroups: ['R3JvdXA6Z3JvdXAx', 'R3JvdXA6Z3JvdXA1', 'R3JvdXA6Z3JvdXA2'],
      },
    },
    'internal_admin',
  );
  expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
  expect(updateResponse).toMatchSnapshot({
    updateAlphaProject: {
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

it('update a newly created project and add a minimum vote number', async () => {
  const createResponse = await graphql(
    CreateAlphaProjectMutation,
    {
      input: {
        ...BASE_PROJECT,
      },
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
            votesMin: 1,
            votesLimit: 3,
          },
        ],
      },
    },
    'internal_admin',
  );
  expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
});

it('update a newly created project and add a new DebateStep', async () => {
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
        steps: [BASE_DEBATE_STEP],
      },
    },
    'internal_admin',
  );
  expect(projectId).toBe(updateResponse.updateAlphaProject.project.id);
  expect(updateResponse).toMatchSnapshot({
    updateAlphaProject: {
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

it('update an existing project with a DebateStep to add a PresentationStep', async () => {
  const updateResponse = await graphql(
    UpdateAlphaProjectMutation,
    {
      input: {
        projectId: toGlobalId('Project', 'projectCannabis'),
        ...BASE_PROJECT,
        steps: [
          BASE_PRESENTATION_STEP,
          { ...BASE_DEBATE_STEP, id: toGlobalId('DebateStep', 'debateStepCannabis') },
        ],
      },
    },
    'internal_admin',
  );
  expect(updateResponse).toMatchSnapshot({
    updateAlphaProject: {
      project: {
        steps: [
          {
            id: expect.any(String),
          },
          {},
        ],
      },
    },
  });
});

describe('project access control', () => {
  const BASE_INPUT = {
    title: 'Projet avec administrateur de projet',
    authors: ['VXNlcjp1c2VyU3B5bA=='],
    projectType: '2',
    Cover: null,
    video: null,
    themes: [],
    districts: [],
    metaDescription: null,
    isExternal: false,
    publishedAt: '2020-06-19 13:00:00',
    visibility: 'PUBLIC',
    opinionCanBeFollowed: false,
    steps: [
      {
        id: 'pstepProjectWithOwner',
        body: 'Je suis un projet qui contient un administrateur de projet (dit owner en API)',
        type: 'PRESENTATION',
        title: 'Présentation',
        startAt: null,
        endAt: null,
        label: 'Présentation',
        customCode: null,
        metaDescription: null,
        isEnabled: true,
        requirements: [],
      },
      {
        id: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcFByb2plY3RPd25lcg==',
        body: "Je suis une belle étape de consultation au sein d'un projet avec un administrateur de projet",
        timeless: false,
        type: 'CONSULTATION',
        title: 'Étape de consultation dans un projet avec administrateur de projet',
        startAt: '2020-11-03 20:30:55',
        endAt: '2032-11-03 06:45:12',
        label: 'Consultation',
        customCode: null,
        metaDescription: null,
        isEnabled: true,
        consultations: ['Q29uc3VsdGF0aW9uOmNvbnN1bHRhdGlvblByb2plY3RXaXRoT3duZXI='],
        requirements: [],
        requirementsReason: null,
      },
      {
        id: 'Q29sbGVjdFN0ZXA6Y29sbGVjdFN0ZXBQcm9qZWN0V2l0aE93bmVy',
        body: 'Ouais le body ouais',
        timeless: false,
        type: 'COLLECT',
        title: 'Budget participatif du projet avec administrateur de projet',
        startAt: '2020-10-16 00:00:00',
        endAt: '2021-10-16 00:00:00',
        label: 'Dépôt',
        customCode: null,
        metaDescription: null,
        isEnabled: true,
        allowAuthorsToAddNews: false,
        defaultSort: 'RANDOM',
        mainView: 'grid',
        proposalForm: 'proposalFormProjectWithOwner',
        private: false,
        defaultStatus: null,
        statuses: [],
        votesHelpText: null,
        votesLimit: null,
        votesMin: null,
        votesRanking: false,
        voteThreshold: null,
        voteType: 'DISABLED',
        budget: null,
        requirements: [],
        requirementsReason: null,
      },
      {
        id: 'questionnaireStepProjectWithOwner',
        body: 'Ici ça va pookie fort',
        timeless: false,
        type: 'QUESTIONNAIRE',
        title: 'Questionnaire administrateur de projet',
        startAt: '2020-09-11 00:00:00',
        endAt: '2024-09-27 00:00:00',
        label: 'Questionnaire qui dénonce',
        customCode: null,
        metaDescription: null,
        isEnabled: true,
        requirements: [],
        questionnaire: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlUHJvamVjdFdpdGhPd25lcg==',
        footer: null,
      },
    ],
    locale: null,
    archived: false,
  };
  it('should update a project with an owner when user is a project admin and the owner', async () => {
    const response = await graphql(
      UpdateAlphaProjectMutation,
      { input: { ...BASE_INPUT, projectId: toGlobalId('Project', 'projectWithOwner') } },
      'internal_theo',
    );
    expect(response.updateAlphaProject).not.toBeNull();
  });

  it('should not update a project with an owner when user is a project admin and not the owner', async () => {
    await expect(
      graphql(
        UpdateAlphaProjectMutation,
        { input: { ...BASE_INPUT, projectId: toGlobalId('Project', 'projectIdf3') } },
        'internal_kiroule',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('should not update a project when user is a project admin and set the project visibility to `ADMIN`', async () => {
    await expect(
      graphql(
        UpdateAlphaProjectMutation,
        {
          input: {
            ...BASE_INPUT,
            projectId: toGlobalId('Project', 'projectIdf3'),
            visibility: 'ADMIN',
          },
        },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('should not update the owner when admin edit a owned project ', async () => {
    const response = await graphql(
      UpdateAlphaProjectMutation,
      {
        input: {
          ...BASE_INPUT,
          projectId: toGlobalId('Project', 'projectWithOwner'),
        },
      },
      'internal_admin',
    );

    expect(response.updateAlphaProject.project.owner.username).toBe('Théo QP');
  });
});
