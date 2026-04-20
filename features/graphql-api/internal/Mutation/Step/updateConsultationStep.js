/* eslint-env jest */
import '../../../_setupDB'

const UpdateConsultationStep = /* GraphQL*/ `
  mutation UpdateConsultationStepMutation($input: UpdateConsultationStepInput!) {
    updateConsultationStep(input: $input) {
      consultationStep {
        id
        cover {
          id
          name
        }
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
      }
    }
  }
`

const input = {
  stepId: toGlobalId('ConsultationStep', 'cstep1'),
  label: 'updated consultation label',
  body: 'updated consultation body',
  cover: 'media2',
  startAt: '2023-01-03 16:29:17',
  endAt: '2024-01-03 16:29:17',
  timeless: false,
  isEnabled: true,
  metaDescription: 'updated consultation metadescription',
  customCode: 'updated consultation custom code',
  requirements: [
    {
      type: 'FIRSTNAME',
    },
  ],
  requirementsReason: 'updated consultation requirements reason',
  consultations: [toGlobalId('Consultation', 'default')],
}

describe('mutations.updateConsultationStep', () => {
  it('admin should be able to edit consultationStep step.', async () => {
    const response = await graphql(UpdateConsultationStep, { input }, 'internal_admin')
    expect(response).toMatchSnapshot()
  })
})
