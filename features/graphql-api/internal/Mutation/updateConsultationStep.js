import '../../_setup'

const UpdateConsultationStepMutation = /* GraphQL */ `
  mutation UpdateConsultationStepMutation($input: UpdateConsultationStepInput!) {
    updateConsultationStep(input: $input) {
      consultationStep {
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
        requirements {
          reason
          edges {
            node {
              __typename
            }
          }
        }
        consultations {
          edges {
            node {
              title
              sections {
                title
              }
            }
          }
        }
      }
    }
  }
`

const input = {
  stepId: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDE=',
  label: 'Consultation',
  body: '<p>Distinctio sunt exercitationem omnis quasi. Asperiores fugiat voluptatibus nihil sed vel ut.      Facere alias sunt voluptas quia qui expedita. Quaerat quia sunt impedit labore minima fugiat praesentium. Occaecati ad sunt officia rerum ex enim necessitatibus. Quia consequatur eos molestias voluptatem eum error. Voluptas id omnis cum voluptatem.</p>',
  startAt: '2018-11-01 12:00:00',
  endAt: '2032-11-01 12:00:00',
  timeless: false,
  isEnabled: true,
  metaDescription: '',
  customCode: '',
  requirements: [
    {
      id: '',
      label: '',
      type: 'FIRSTNAME',
    },
    {
      id: '',
      label: '',
      type: 'LASTNAME',
    },
    {
      id: '',
      label: '',
      type: 'PHONE',
    },
  ],
  requirementsReason: '',
  consultations: ['Q29uc3VsdGF0aW9uOmRlZmF1bHQ='],
}

describe('mutations.updateConsultationStep', () => {
  it('should update the step', async () => {
    await expect(graphql(UpdateConsultationStepMutation, { input }, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
