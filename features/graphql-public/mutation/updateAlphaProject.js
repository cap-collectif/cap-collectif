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

describe('Internal|updateAlphaProject simple mutation', () => {
  it('update a newly created project by adding a new PresentationStep', async () => {
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
    expect(updateResponse).toMatchSnapshot();
  });
});
