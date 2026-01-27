/* eslint-env jest */
import '../../../_setupDB'

const UpdateAlphaProjectMutation = /* GraphQL*/ `
    mutation UpdateAlphaProject($input: UpdateAlphaProjectInput!) {
      updateAlphaProject(input: $input) {
        project {
          steps {
            ...on QuestionnaireStep {
              title
              questionnaire {
                id
                title
              }
            }
          }
        }
      }
    }
`

describe('mutations.updateAlphaProjectMutation', () => {
  it('GraphQL admin wants to update project with empty group in custom view', async () => {
    await expect(
      graphql(
        UpdateAlphaProjectMutation,
        {
          input: {
            title: 'Je suis un projet simple',
            cover: 'media1',
            video: 'https://www.youtube.com/watch?v=pjJ2w1FX_Wg',
            authors: ['VXNlcjp1c2VyQWRtaW4=', 'VXNlcjp1c2VyMQ=='],
            metaDescription: 'Je suis la super meta',
            visibility: 'CUSTOM',
            themes: ['theme3'],
            isExternal: false,
            publishedAt: '2019-03-01 12:00:00',
            opinionCanBeFollowed: true,
            steps: [],
            districts: [],
            projectId: 'UHJvamVjdDpwcm9qZWN0Q29yb25h',
            restrictedViewerGroups: [],
            archived: false,
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('global.no_group_when_mandatory')
  })

  it('GraphQL admin wants to update project with votesMin greater than votesLimit', async () => {

    await expect(
      graphql(
        UpdateAlphaProjectMutation,
        {
          input: {
            projectId: 'UHJvamVjdDpwcm9qZWN0Q29yb25h',
            restrictedViewerGroups: [],
            title: 'Je suis un projet simple',
            cover: 'media1',
            video: 'https://www.youtube.com/watch?v=pjJ2w1FX_Wg',
            authors: ['VXNlcjp1c2VyQWRtaW4=', 'VXNlcjp1c2VyMQ=='],
            metaDescription: 'Je suis la super meta',
            visibility: 'PUBLIC',
            themes: ['theme3'],
            isExternal: false,
            publishedAt: '2019-03-01 12:00:00',
            opinionCanBeFollowed: true,
            steps: [
              {
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
                mainView: 'GRID',
                votesMin: 3,
                votesLimit: 1,
                proposalArchivedTime: 0,
                proposalArchivedUnitTime: 'MONTHS',
              },
            ],
            districts: [],
            archived: false,
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('maximum-vote-must-be-higher-than-minimum')
  })

  it('GraphQL admin wants to update project with votesMin below 1', async () => {

    await expect(
      graphql(
        UpdateAlphaProjectMutation,
        {
          input: {
            projectId: 'UHJvamVjdDpwcm9qZWN0Q29yb25h',
            restrictedViewerGroups: [],
            title: 'Je suis un projet simple',
            cover: 'media1',
            video: 'https://www.youtube.com/watch?v=pjJ2w1FX_Wg',
            authors: ['VXNlcjp1c2VyQWRtaW4=', 'VXNlcjp1c2VyMQ=='],
            metaDescription: 'Je suis la super meta',
            visibility: 'PUBLIC',
            themes: ['theme3'],
            isExternal: false,
            publishedAt: '2019-03-01 12:00:00',
            opinionCanBeFollowed: true,
            steps: [
              {
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
                mainView: 'GRID',
                votesMin: 0,
                votesLimit: 1,
                proposalArchivedTime: 0,
                proposalArchivedUnitTime: 'MONTHS',
              },
            ],
            districts: [],
            archived: false,
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('minimum-vote-must-be-greater-than-or-equal')
  })

  it('GraphQL admin wants to update step with another questionnaire', async () => {
    await expect(
      graphql(
        UpdateAlphaProjectMutation,
        {
          input: {
            projectId: 'UHJvamVjdDpwcm9qZWN0OA==',
            title: 'Projet avec questionnaire',
            authors: ['VXNlcjp1c2VyV2VsY29tYXR0aWM='],
            projectType: '7',
            cover: null,
            video: null,
            themes: ['theme3'],
            districts: [],
            metaDescription: null,
            isExternal: false,
            publishedAt: '2014-12-24 00:00:00',
            visibility: 'PUBLIC',
            opinionCanBeFollowed: false,
            steps: [
              {
                id: 'pstep2',
                body: 'Insert Long Text here',
                bodyUsingJoditWysiwyg: false,
                title: 'Présentation',
                startAt: null,
                endAt: null,
                label: 'Présentation',
                customCode: null,
                metaDescription: null,
                isEnabled: true,
                requirements: [],
                type: 'PRESENTATION',
              },
              {
                id: 'questionnairestep1',
                label: 'Questionnaire',
                body: 'Insert Long Text here',
                bodyUsingJoditWysiwyg: false,
                title: 'Questionnaire des JO 2024',
                endAt: '2060-09-27 00:00:00',
                startAt: '2014-09-27 00:00:00',
                isEnabled: true,
                timeless: false,
                metaDescription: null,
                customCode: null,
                requirementsReason: null,
                questionnaire: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlT3duZXJXaXRob3V0U3RlcA==',
                footer: null,
                footerUsingJoditWysiwyg: false,
                requirements: [],
                type: 'QUESTIONNAIRE',
              },
              {
                id: 'questionnairestep2',
                body: 'Insert Long Text here',
                bodyUsingJoditWysiwyg: false,
                timeless: false,
                title: 'Questionnaire',
                startAt: '2014-09-27 00:00:00',
                endAt: '2060-09-27 00:00:00',
                label: 'Questionnaire',
                customCode: null,
                metaDescription: null,
                isEnabled: true,
                requirements: [],
                questionnaire: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMg==',
                footer: null,
                footerUsingJoditWysiwyg: false,
                requirementsReason: null,
                type: 'QUESTIONNAIRE',
              },
              {
                id: 'questionnairestepJump',
                body: 'Insert Long Text here',
                bodyUsingJoditWysiwyg: false,
                timeless: false,
                title: 'Etape de questionnaire avec questionnaire sauts conditionnels',
                startAt: '2014-09-27 00:00:00',
                endAt: '2060-09-27 00:00:00',
                label: 'Questionnaire conditionnel',
                customCode: null,
                metaDescription: null,
                isEnabled: true,
                requirements: [],
                questionnaire: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlV2l0aEp1bXBz',
                footer: null,
                footerUsingJoditWysiwyg: false,
                requirementsReason: null,
                type: 'QUESTIONNAIRE',
              },
              {
                id: 'questionnairestepJump2',
                body: 'Insert Long Text here',
                bodyUsingJoditWysiwyg: false,
                timeless: false,
                title: 'Essais de sauts conditionnels',
                startAt: '2014-09-27 00:00:00',
                endAt: '2060-09-27 00:00:00',
                label: 'Questionnaire conditionnel',
                customCode: null,
                metaDescription: null,
                isEnabled: true,
                requirements: [],
                questionnaire: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlV2l0aEp1bXBzMg==',
                footer: null,
                footerUsingJoditWysiwyg: false,
                requirementsReason: null,
                type: 'QUESTIONNAIRE',
              },
              {
                id: 'questionnairestep3',
                body: 'Insert Long Text here',
                bodyUsingJoditWysiwyg: false,
                timeless: false,
                title: 'Etape de questionnaire fermée',
                startAt: '2014-09-27 00:00:00',
                endAt: '2016-09-27 00:00:00',
                label: 'Questionnaire',
                customCode: null,
                metaDescription: null,
                isEnabled: true,
                requirements: [],
                questionnaire: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMw==',
                footer: null,
                footerUsingJoditWysiwyg: false,
                requirementsReason: null,
                type: 'QUESTIONNAIRE',
              },
              {
                id: 'questionnaireStepLotChoices',
                body: 'Une étape avec un questionnaire avec beaucoup de choix',
                bodyUsingJoditWysiwyg: false,
                timeless: false,
                title: 'Questionnaire avec beaucoup de choix',
                startAt: '2020-01-01 00:00:00',
                endAt: '2028-09-27 00:00:00',
                label: 'Questionnaire choix',
                customCode: null,
                metaDescription: null,
                isEnabled: true,
                requirements: [],
                questionnaire: 'UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlTG90Q2hvaWNlcw==',
                footer: null,
                footerUsingJoditWysiwyg: false,
                requirementsReason: null,
                type: 'QUESTIONNAIRE',
              },
              {
                id: 'questionnairestep6',
                body: 'Insert Long Text here',
                bodyUsingJoditWysiwyg: false,
                timeless: false,
                title: 'Questionnaire avec des conditions requises',
                startAt: '2014-09-27 00:00:00',
                endAt: '2060-09-27 00:00:00',
                label: 'Faut répondre au questionnaire pour avoir un bonbon',
                customCode: null,
                metaDescription: null,
                isEnabled: true,
                requirements: [
                  {
                    id: 'UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQxOA==',
                    type: 'FIRSTNAME',
                  },
                  {
                    id: 'UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQxOQ==',
                    type: 'LASTNAME',
                  },
                  {
                    id: 'UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQyMA==',
                    type: 'POSTAL_ADDRESS',
                  },
                  {
                    id: 'UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQyMQ==',
                    type: 'IDENTIFICATION_CODE',
                  },
                ],
                questionnaire: 'UXVlc3Rpb25uYWlyZTpxQXZlY0Rlc0NvbmRpdGlvbnNSZXF1aXNlcw==',
                footer: null,
                footerUsingJoditWysiwyg: false,
                requirementsReason: null,
                type: 'QUESTIONNAIRE',
              },
            ],
            locale: null,
            archived: false,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
