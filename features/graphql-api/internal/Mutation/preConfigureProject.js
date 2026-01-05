/* eslint-env jest */
import '../../_setup'

const PreConfigureProject = /* GraphQL*/ `
  mutation PreConfigureProjectMutation($input: PreConfigureProjectInput!) {
    preConfigureProject(input: $input) {
        project {
          title
          steps {
            __typename
            label
            title
            body
            enabled
            slug
            ...on CollectStep {
              form {
                title
                analysisConfiguration {
                  proposalForm {
                    title
                  }
                  evaluationForm {
                    title
                  }
                  analysisStep {
                    title
                  }
                  moveToSelectionStep {
                    title
                  }
                  selectionStepStatus {
                    name
                  }
                  unfavourableStatuses {
                    name
                  }
                  favourableStatus {
                    name
                  }
                }
              }
              defaultSort
              defaultStatus {
                name
              }
            }
            ...on SelectionStep {
              mainView
              statuses {
                name
              }
              defaultStatus {
                name
              }
              requirements {
                edges {
                  node {
                    __typename
                    ...on CheckboxRequirement {
                      label
                    }
                  }
                }
              }
            }
          }
        }
    }
  }
`

const authors = [toGlobalId('User', 'user1')]
const projectTitle = 'project title'
const proposalFormTitle = `${projectTitle} - Formulaire de dépôt`
const questionnaireTitle = `${projectTitle} - Formulaire d'analyse`

const participatoryBudgetInput = {
  questionnaires: [
    {
      title: questionnaireTitle,
      description: "Merci de répondre aux différentes questions afin d'analyser le projet.",
      questions: [
        {
          question: {
            title: 'Critères de sélection',
            private: false,
            required: false,
            jumps: [],
            alwaysJumpDestinationQuestion: null,
            type: 'section',
            level: 0,
          },
        },
        {
          question: {
            title: 'Le projet est-il conforme ?',
            private: false,
            required: false,
            type: 'radio',
            choices: [
              {
                title: 'Oui',
              },
              {
                title: 'Non',
              },
            ],
            jumps: [
              {
                conditions: [
                  {
                    operator: 'IS',
                    question: 'Le projet est-il conforme ?',
                    value: 'Non',
                  },
                ],
                origin: 'Le projet est-il conforme ?',
                destination: 'Pourquoi ?',
              },
            ],
            alwaysJumpDestinationQuestion: 'Estimation du coût du projet',
          },
        },
        {
          question: {
            title: 'Pourquoi ?',
            private: false,
            required: false,
            jumps: [],
            alwaysJumpDestinationQuestion: null,
            type: 'text',
          },
        },
        {
          question: {
            title: 'Estimation du coût du projet',
            private: false,
            required: false,
            jumps: [],
            alwaysJumpDestinationQuestion: null,
            type: 'textarea',
          },
        },
      ],
    },
  ],
  proposalForms: [
    {
      title: proposalFormTitle,
      usingCategories: true,
      usingAddress: true,
      usingDescription: true,
      isGridViewEnabled: true,
      isListViewEnabled: true,
      objectType: 'PROPOSAL',
      usingFacebook: false,
      usingWebPage: false,
      usingTwitter: false,
      usingInstagram: false,
      usingYoutube: false,
      usingLinkedIn: false,
    },
  ],
  project: {
    title: `${projectTitle}`,
    authors,
    projectType: 'participatory-budgeting',
    themes: [],
    districts: [],
    metaDescription: null,
    publishedAt: '2022-12-12 16:26:11',
    visibility: 'ME',
    opinionCanBeFollowed: true,
    isExternal: false,
    steps: [
      {
        body: "<p>- C'est quoi un BP</p><p>- Calendrier / démarche</p><p>- Règlement</p>",
        title: '',
        label: 'Présentation de votre projet',
        isEnabled: true,
        requirements: [],
        type: 'PRESENTATION',
      },
      {
        body: '<p>- Rappel du fonctionnement</p><p>- Critères pour les idées</p><p>- Exemple de projet recevable / non recevable</p>',
        title: '',
        startAt: null,
        endAt: null,
        label: 'Dépôt des projets',
        isEnabled: true,
        defaultSort: 'RANDOM',
        mainView: 'GRID',
        proposalForm: proposalFormTitle,
        private: false,
        requirements: [],
        type: 'COLLECT',
        voteType: 'DISABLED',
        proposalArchivedTime: 0,
        proposalArchivedUnitTime: 'MONTHS',
      },
      {
        label: "L'analyse des projets",
        body: null,
        title: '',
        startAt: null,
        endAt: null,
        isEnabled: true,
        mainView: 'GRID',
        requirements: [],
        statuses: [
          {
            color: 'WARNING',
            name: "En cours d'analyse",
          },
          {
            color: 'SUCCESS',
            name: 'Soumis au vote',
          },
          {
            color: 'DANGER',
            name: 'Non réalisable',
          },
          {
            color: 'DANGER',
            name: 'Hors cadre',
          },
          {
            color: 'DANGER',
            name: 'Déjà prévu',
          },
          {
            color: 'PRIMARY',
            name: 'Fusionné',
          },
        ],
        defaultStatus: "En cours d'analyse",
        defaultSort: 'RANDOM',
        type: 'SELECTION',
        voteType: 'DISABLED',
        proposalArchivedTime: 0,
        proposalArchivedUnitTime: 'MONTHS',
      },
      {
        label: 'Vote',
        title: '',
        startAt: null,
        endAt: null,
        isEnabled: true,
        mainView: 'GRID',
        requirements: [
          {
            type: 'FIRSTNAME',
          },
          {
            type: 'LASTNAME',
          },
          {
            type: 'PHONE',
          },
          {
            type: 'DATE_OF_BIRTH',
          },
          {
            type: 'POSTAL_ADDRESS',
          },
          {
            type: 'CHECKBOX',
            label: "J'atteste avoir plus de 16 ans",
          },
        ],
        statuses: [
          {
            color: 'PRIMARY',
            name: 'Soumis au vote',
          },
        ],
        defaultSort: 'RANDOM',
        defaultStatus: 'Soumis au vote',
        votesLimit: 3,
        allowAuthorsToAddNews: true,
        type: 'SELECTION',
        voteType: 'SIMPLE',
        proposalArchivedTime: 0,
        proposalArchivedUnitTime: 'MONTHS',
      },
      {
        label: 'Projets lauréats',
        title: '',
        startAt: null,
        endAt: null,
        isEnabled: true,
        mainView: 'GRID',
        requirements: [],
        statuses: [
          {
            color: 'SUCCESS',
            name: 'Projet réalisé',
          },
          {
            color: 'WARNING',
            name: 'Projet en cours de réalisation',
          },
          {
            color: 'WARNING',
            name: "Projet en cours d'étude",
          },
          {
            color: 'PRIMARY',
            name: 'Projet lauréats',
          },
        ],
        defaultSort: 'RANDOM',
        allowingProgressSteps: true,
        defaultStatus: 'Projet lauréats',
        type: 'SELECTION',
        voteType: 'DISABLED',
        proposalArchivedTime: 0,
        proposalArchivedUnitTime: 'MONTHS',
      },
    ],
    locale: null,
    archived: false,
  },
  analysisForm: {
    proposalFormId: proposalFormTitle,
    evaluationFormId: questionnaireTitle,
    analysisStepId: "L'analyse des projets",
    effectiveDate: '2022-01-20',
    moveToSelectionStepId: 'Vote',
    selectionStepStatusId: 'Soumis au vote',
    unfavourableStatuses: ['Non réalisable', 'Hors cadre', 'Déjà prévu'],
    favourableStatus: 'Soumis au vote',
    costEstimationEnabled: false,
  },
}

describe('mutations.preConfigureProject', () => {
  it('should configure a project with participatory budget preset', async () => {
    const response = await graphql(
      PreConfigureProject,
      {
        input: participatoryBudgetInput,
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
})
