/* eslint-env jest */
import '../../_setup'

const DuplicateProjectMutation = /* GraphQL */ `
  mutation DuplicateProject($input: DuplicateProjectInput!) {
    duplicateProject(input: $input) {
      newProject {
        steps {
          ... on ConsultationStep {
            title
            timeless
            body
            bodyUsingJoditWysiwyg
            requirements {
              edges {
                node {
                  type
                }
              }
            }
            state
            consultations {
              ... on ConsultationConnection {
                edges {
                  node {
                    title
                    description
                    illustration {
                      name
                      authorName
                      size
                    }
                    contribuable
                    opinionCountShownBySection
                    titleHelpText
                    descriptionHelpText
                    sections {
                      title
                      description
                      slug
                      color
                    }
                  }
                }
              }
            }
          }
        }
      }
      oldProject {
        steps {
          ... on ConsultationStep {
            title
            timeless
            body
            bodyUsingJoditWysiwyg
            requirements {
              edges {
                node {
                  type
                }
              }
            }
            state
            consultations {
              ... on ConsultationConnection {
                edges {
                  node {
                    title
                    description
                    illustration {
                      name
                      authorName
                      size
                    }
                    contribuable
                    opinionCountShownBySection
                    titleHelpText
                    descriptionHelpText
                    sections {
                      title
                      description
                      slug
                      color
                    }
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

describe('Internal | duplicateProjectWithADebate', () => {
  it('duplicate wysiwyg debate project, both projects must be identical.', async () => {
    const duplicateProjectResponse = await graphql(
      DuplicateProjectMutation,
      {
        input: {
          id: toGlobalId('Project', 'project2'),
        },
      },
      'internal_admin',
    )

    const newProjectFirstConsultationStep = duplicateProjectResponse.duplicateProject.newProject.steps[0]
    const oldProjectFirstConsultationStep = duplicateProjectResponse.duplicateProject.oldProject.steps[0]

    expect(newProjectFirstConsultationStep).toEqual(oldProjectFirstConsultationStep)
    expect(newProjectFirstConsultationStep).toEqual(oldProjectFirstConsultationStep)

    //The second step is not a consultation step, so we need to compare the third step
    const newProjectSecondConsultationStep = duplicateProjectResponse.duplicateProject.newProject.steps[2]
    const oldProjectSecondConsultationStep = duplicateProjectResponse.duplicateProject.oldProject.steps[2]

    expect(newProjectSecondConsultationStep).toEqual(oldProjectSecondConsultationStep)
    expect(newProjectSecondConsultationStep).toEqual(oldProjectSecondConsultationStep)
  })
})
