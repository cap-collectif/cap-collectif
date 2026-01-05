/* eslint-env jest */
import '../../../_setup'

const UpdateQuestionnaireStep = /* GraphQL*/ `
  mutation UpdateQuestionnaireStepMutation($input: UpdateQuestionnaireStepInput!) {
    updateQuestionnaireStep(input: $input) {
      questionnaireStep {
        id
        title
        label
        body
        timeRange {
          startAt
          endAt
        }
        timeless
        enabled
        metaDescription
        customCode
        footer
        requirements {
          reason
          edges {
            node {
              __typename
            }
          }
        }
      }
    }
  }
`

// UXVlc3Rpb25uYWlyZVN0ZXA6cVN0ZXBQcm9qZWN0QW5vbnltb3VzUXVlc3Rpb25uYWlyZQ==
const stepId = toGlobalId('QuestionnaireStep', 'qStepProjectAnonymousQuestionnaire')
// UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlQW5vbnltb3Vz
const questionnaireId = toGlobalId('Questionnaire', 'questionnaireAnonymous')

const input = {
  questionnaire: questionnaireId,
  stepId: stepId,
  label: 'updated label',
  body: 'updated body',
  startAt: '2023-01-03 16:29:17',
  endAt: '2024-01-03 16:29:17',
  timeless: false,
  isEnabled: true,
  metaDescription: 'updated metadescription',
  customCode: 'updated custom code',
  footer: 'updated footer',
  requirements: [
    {
      type: 'FIRSTNAME',
    },
    {
      type: 'LASTNAME',
    },
  ],
}

describe('mutations.updateQuestionnaireStep', () => {
  it('admin should be able to edit questionnaireStep step.', async () => {
    const response = await graphql(UpdateQuestionnaireStep, { input: { ...input } }, 'internal_admin')
    expect(response).toMatchSnapshot()
  })
})
