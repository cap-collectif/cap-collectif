/* eslint-env jest */
import '../../../_setupDB'

const AddDebateStep = /* GraphQL*/ `
  mutation AddDebateStep($input: AddStepInput!) {
    addDebateStep(input: $input) {
        step {
            __typename
            label
            title
            body
            enabled
            timeless
            ... on DebateStep {
                debateType
                isAnonymousParticipationAllowed
            }
        }
    }
  }
`

describe('mutations.addDebateStepMutation', () => {
  it('admin should be able to add debate step.', async () => {
    const response = await graphql(
      AddDebateStep,
      { input: { projectId: toGlobalId('Project', 'project9') } },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
  it('admin project should be able to add debate step.', async () => {
    const response = await graphql(
      AddDebateStep,
      { input: { projectId: toGlobalId('Project', 'projectWithOwner') } },
      'internal_theo',
    )
    expect(response).toMatchSnapshot()
  })
  it('orga member should be able to add debate step.', async () => {
    const response = await graphql(
      AddDebateStep,
      { input: { projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') } },
      'internal_christophe',
    )
    expect(response).toMatchSnapshot()
  })
})
