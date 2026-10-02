/* eslint-env jest */
import '../../../_setupDB'

const AddOtherStep = /* GraphQL*/ `
  mutation AddOtherStep($input: AddStepInput!) {
    addOtherStep(input: $input) {
      step {
        __typename
        title
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.addOtherStepMutation', () => {
  it('admin should be able to add other step.', async () => {
    const response = await graphql(
      AddOtherStep,
      { input: { projectId: toGlobalId('Project', 'project9') } },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
  it('admin project should be able to add other step.', async () => {
    const response = await graphql(
      AddOtherStep,
      { input: { projectId: toGlobalId('Project', 'projectWithOwner') } },
      'internal_theo',
    )
    expect(response).toMatchSnapshot()
  })
  it('orga member should be able to add other step.', async () => {
    const response = await graphql(
      AddOtherStep,
      { input: { projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') } },
      'internal_christophe',
    )
    expect(response).toMatchSnapshot()
  })
})
