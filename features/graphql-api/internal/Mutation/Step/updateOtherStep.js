/* eslint-env jest */
import '../../../_setupDB'

const UpdateOtherStep = /* GraphQL*/ `
  mutation UpdateOtherStepMutation($input: UpdateOtherStepInput!) {
    updateOtherStep(input: $input) {
      step {
        adminUrl
        title
        label
        slug
        body
        metaDescription
        enabled
        customCode
        timeRange {
          startAt
          endAt
        }
        timeless
      }
    }
  }
`

const input = {
  label: 'updated label',
  body: 'updated body',
  isEnabled: false,
  metaDescription: 'updated metadescription',
  customCode: 'updated custom code',
  startAt: '2023-01-03 16:29:17',
  endAt: '2023-01-03 16:29:17',
  timeless: false,
  stepId: toGlobalId('OtherStep', 'ostep1'), // T3RoZXJTdGVwOm9zdGVwMQ==
}

describe('mutations.addOtherStepMutation', () => {
  it('admin should be able to edit other step.', async () => {
    const response = await graphql(UpdateOtherStep, { input }, 'internal_admin')
    expect(response).toMatchSnapshot()
  })
})
