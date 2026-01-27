/* eslint-env jest */
import '../../_setupDB'

const DuplicateProjectMutation = /* GraphQL */ `
  mutation DuplicateProject($input: DuplicateProjectInput!) {
    duplicateProject(input: $input) {
      newProject {
        steps {
          ... on DebateStep {
            title
            timeless
            bodyUsingJoditWysiwyg
            debateType
            debateContent
            debateContentUsingJoditWysiwyg
            isAnonymousParticipationAllowed
            debate {
              articles {
                edges {
                  node {
                    title
                    description
                    url
                  }
                }
              }
              opinions {
                edges {
                  node {
                    title
                    body
                    author {
                      username
                      firstname
                      lastname
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
          ... on DebateStep {
            title
            timeless
            bodyUsingJoditWysiwyg
            debateType
            debateContent
            debateContentUsingJoditWysiwyg
            isAnonymousParticipationAllowed
            debate {
              articles {
                edges {
                  node {
                    title
                    description
                    url
                  }
                }
              }
              opinions {
                edges {
                  node {
                    title
                    body
                    author {
                      username
                      firstname
                      lastname
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
          id: toGlobalId('Project', 'projectWysiwyg'),
        },
      },
      'internal_admin',
    )

    const newProjectStep = duplicateProjectResponse.duplicateProject.newProject.steps[0]
    const oldProjectStep = duplicateProjectResponse.duplicateProject.oldProject.steps[0]

    expect(newProjectStep).toEqual(oldProjectStep)
  })

  it('duplicate face to face debate project on Cannabis, both projects must be identical.', async () => {
    const duplicateProjectResponse = await graphql(
      DuplicateProjectMutation,
      {
        input: {
          id: toGlobalId('Project', 'projectCannabis'),
        },
      },
      'internal_admin',
    )

    const newProjectStep = duplicateProjectResponse.duplicateProject.newProject.steps[0]
    const oldProjectStep = duplicateProjectResponse.duplicateProject.oldProject.steps[0]

    expect(newProjectStep).toEqual(oldProjectStep)
  })
})
