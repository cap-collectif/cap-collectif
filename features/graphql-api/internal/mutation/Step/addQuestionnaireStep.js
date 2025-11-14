/* eslint-env jest */
import '../../../_setup'

const AddQuestionnaireStep = /* GraphQL*/ `
  mutation AddQuestionnaireStep($input: AddStepInput!) {
    addQuestionnaireStep(input: $input) {
        step {
            __typename
            label
            title
            body
            enabled
            ... on QuestionnaireStep {
                questionnaire {
                    owner {
                        username
                    }
                    creator {
                        username
                    }
                    title
                    description
                    questions {
                        title
                        type
                        position
                    }
                }
            }
        }
    }
  }
`

describe('mutations.addQuestionnaireStepMutation', () => {
  it('admin should be able to add questionnaire step.', async () => {
    const response = await graphql(
      AddQuestionnaireStep,
      { input: { projectId: toGlobalId('Project', 'project9') } },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
  it('admin project should be able to add questionnaire step.', async () => {
    const response = await graphql(
      AddQuestionnaireStep,
      { input: { projectId: toGlobalId('Project', 'projectWithOwner') } },
      'internal_theo',
    )
    expect(response).toMatchSnapshot()
  })
  it('orga member should be able to add questionnaire step.', async () => {
    const response = await graphql(
      AddQuestionnaireStep,
      { input: { projectId: toGlobalId('Project', 'projectOrgaVisibilityMe') } },
      'internal_christophe',
    )
    expect(response).toMatchSnapshot()
  })
  it('questionnaire owner should be organization when admin create the step in a project owned by an organization.', async () => {
    const response = await graphql(
      AddQuestionnaireStep,
      { input: { projectId: toGlobalId('Project', 'projectOrgaVisibilityAdminAndMe') } },
      'internal_super_admin',
    )
    expect(response).toMatchSnapshot()
  })
})
