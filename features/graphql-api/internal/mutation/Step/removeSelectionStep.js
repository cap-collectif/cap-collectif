//* eslint-env jest */
const AddAnalysisStep = /* GraphQL*/ `
    mutation AddAnalysisStep($input: AddStepInput!) {
        addAnalysisStep(input: $input) {
            step {
                __typename
                title
                ... on SelectionStep {
                    id
                }
            }
        }
    }
`

const RemoveSelectionStepMutation = /* GraphQL */ `
  mutation DeleteStepMutation($input: DeleteStepInput!) {
    deleteStep(input: $input) {
      stepId
    }
  }
`

const ProjectQuery = /* GraphQL */ `
  query ProjectQuery($projectId: ID!) {
    node(id: $projectId) {
      id
      ... on Project {
        steps {
          ... on CollectStep {
            form {
              title
            }
          }
        }
      }
    }
  }
`

describe('Internal|SelectionStep.remove', () => {
  it('removes a selectionStep', async () => {
    const response = await graphql(
      AddAnalysisStep,
      { input: { projectId: 'UHJvamVjdDpwcm9qZWN0OQ==' } }, // Project:project9
      'internal_admin',
    )

    await expect(
      graphql(
        RemoveSelectionStepMutation,
        {
          input: {
            deleteRelatedResource: true,
            stepId: response.addAnalysisStep.step.id,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      deleteStep: {
        stepId: expect.any(String),
      },
    })

    const projectResponse = await graphql(
      ProjectQuery,
      {
        projectId: 'UHJvamVjdDpwcm9qZWN0OQ==', // Project:project9
      },
      'internal_admin',
    )

    expect(projectResponse.node.steps[0].form.title).toEqual('Formulaire de la collecte 5')
  })
})
