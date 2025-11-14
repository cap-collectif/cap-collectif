/* eslint-env jest */
import '../../_setup'

const DuplicateProjectMutation = /* GraphQL */ `
  mutation DuplicateProject($input: DuplicateProjectInput!) {
    duplicateProject(input: $input) {
      newProject {
        authors {
          username
        }
        themes {
          title
        }
        visibility
        restrictedViewers {
          totalCount
        }
        steps {
          ... on CollectStep {
            title
            form {
              notificationsConfiguration {
                onCreate
                onUpdate
                onDelete
                onCommentCreate
                onCommentUpdate
                onCommentDelete
                onProposalNewsCreate
                onProposalNewsUpdate
                onProposalNewsDelete
              }
              analysisConfiguration {
                analysisStep {
                  title
                }
                favourableStatus {
                  name
                }
                unfavourableStatuses {
                  name
                }
              }
              questions {
                title
                jumps {
                  id
                }
              }
            }
          }
          ... on SelectionStep {
            title
          }
        }
      }
      oldProject {
        authors {
          username
        }
        themes {
          title
        }
        visibility
        steps {
          ... on CollectStep {
            title
            form {
              notificationsConfiguration {
                onCreate
                onUpdate
                onDelete
                onCommentCreate
                onCommentUpdate
                onCommentDelete
                onProposalNewsCreate
                onProposalNewsUpdate
                onProposalNewsDelete
              }
              analysisConfiguration {
                analysisStep {
                  title
                }
                favourableStatus {
                  name
                }
                unfavourableStatuses {
                  name
                }
              }
              questions {
                title
                jumps {
                  id
                }
              }
            }
          }
          ... on SelectionStep {
            title
          }
        }
      }
    }
  }
`

describe('Internal | duplicateProject', () => {
  it('duplicate project idf, both projects must be identical.', async () => {
    const duplicateProjectResponse = await graphql(
      DuplicateProjectMutation,
      {
        input: {
          id: 'UHJvamVjdDpwcm9qZWN0SWRm', //projectIdf
        },
      },
      'internal_admin',
    )
    const newProject = duplicateProjectResponse.duplicateProject.newProject
    const oldProject = duplicateProjectResponse.duplicateProject.oldProject

    expect(newProject.steps[0].form.questions).toHaveLength(oldProject.steps[0].form.questions.length)
    newProject.steps[0].form.questions.forEach((question, i) => {
      expect(question.jumps).toHaveLength(oldProject.steps[0].form.questions[i].jumps.length ?? 0)
    })
    newProject.authors.forEach((author, i) => {
      expect(author.username).toBe(oldProject.authors[i].username)
    })
    newProject.themes.forEach((theme, i) => {
      expect(theme.title).toBe(oldProject.themes[i].title)
    })
    newProject.steps[0].form.analysisConfiguration.unfavourableStatuses.forEach((status, i) => {
      expect(status.name).toBe(oldProject.steps[0].form.analysisConfiguration.unfavourableStatuses[i].name)
    })
    expect(newProject.steps[0].form.analysisConfiguration.favourableStatus.name).toBe(
      oldProject.steps[0].form.analysisConfiguration.favourableStatus.name,
    )

    expect(newProject.steps[0].form.notificationsConfiguration.onCreate).toEqual(
      oldProject.steps[0].form.notificationsConfiguration.onCreate,
    )
    expect(newProject.steps[0].form.notificationsConfiguration.onCreate).toEqual(true)

    expect(newProject.steps[0].form.notificationsConfiguration.onUpdate).toEqual(true)
    expect(newProject.steps[0].form.notificationsConfiguration.onDelete).toEqual(true)

    expect(newProject.steps[0].form.notificationsConfiguration.onCommentCreate).toEqual(
      oldProject.steps[0].form.notificationsConfiguration.onCommentCreate,
    )
    expect(newProject.steps[0].form.notificationsConfiguration.onCommentCreate).toEqual(true)
    expect(newProject.steps[0].form.notificationsConfiguration.onCommentUpdate).toEqual(
      oldProject.steps[0].form.notificationsConfiguration.onCommentUpdate,
    )
    expect(newProject.steps[0].form.notificationsConfiguration.onCommentUpdate).toEqual(true)
    expect(newProject.steps[0].form.notificationsConfiguration.onCommentDelete).toEqual(
      oldProject.steps[0].form.notificationsConfiguration.onCommentDelete,
    )
    expect(newProject.steps[0].form.notificationsConfiguration.onCommentDelete).toEqual(true)

    expect(newProject.steps[0].form.notificationsConfiguration.onProposalNewsCreate).toEqual(
      oldProject.steps[0].form.notificationsConfiguration.onProposalNewsCreate,
    )
    expect(newProject.steps[0].form.notificationsConfiguration.onProposalNewsCreate).toEqual(false)
    expect(newProject.steps[0].form.notificationsConfiguration.onProposalNewsUpdate).toEqual(false)
    expect(newProject.steps[0].form.notificationsConfiguration.onProposalNewsDelete).toEqual(false)

    expect(newProject.visibility).toBe('ME')
  })

  it('duplicate project with same owner as viewer, duplicate project must have ME visibility', async () => {
    const duplicateProjectResponse = await graphql(
      DuplicateProjectMutation,
      {
        input: {
          id: 'UHJvamVjdDpleHRlcm5hbFByb2plY3Q=', // externalProject
        },
      },
      'internal_welcomatic',
    )
    const newProject = duplicateProjectResponse.duplicateProject.newProject

    expect(newProject.visibility).toBe('ME')
  })

  it('duplicate project with admin user, ADMIN visibility must be set', async () => {
    const duplicateProjectResponse = await graphql(
      DuplicateProjectMutation,
      {
        input: {
          id: 'UHJvamVjdDpwcm9qZWN0T3JnYVZpc2liaWxpdHlBZG1pbkFuZE1l', // projectOrgaVisibilityAdminAndMe
        },
      },
      'internal_super_admin',
    )
    const newProject = duplicateProjectResponse.duplicateProject.newProject

    expect(newProject.visibility).toBe('ADMIN')
  })

  it('should duplicate project with restricted groups, it should switch to visibility ME and remove groups', async () => {
    const duplicateProjectResponse = await graphql(
      DuplicateProjectMutation,
      {
        input: {
          id: 'UHJvamVjdDpQcm9qZWN0V2l0aEN1c3RvbUFjY2Vzcw==', // ProjectWithCustomAccess
        },
      },
      'internal_super_admin',
    )
    const newProject = duplicateProjectResponse.duplicateProject.newProject

    expect(newProject.visibility).toBe('ME')

    expect(newProject.restrictedViewers.totalCount).toBe(0)
  })
})
