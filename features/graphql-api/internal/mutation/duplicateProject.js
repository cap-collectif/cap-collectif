/* eslint-env jest */
import '../../_setup';

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
        steps {
          ... on CollectStep {
            title
            form {
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
        steps {
          ... on CollectStep {
            title
            form {
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
`;

describe('Internal | duplicateProject', () => {
  it('duplicate project idf, both projects must be identical.', async () => {
    const duplicateProjectResponse = await graphql(
      DuplicateProjectMutation,
      {
        input: {
          id: 'projectIdf',
        },
      },
      'internal_admin',
    );
    const newProject = duplicateProjectResponse.duplicateProject.newProject;
    const oldProject = duplicateProjectResponse.duplicateProject.oldProject;

    expect(newProject.steps[0].form.questions).toHaveLength(
      oldProject.steps[0].form.questions.length,
    );
    newProject.steps[0].form.questions.forEach((question, i) => {
      expect(question.jumps).toHaveLength(oldProject.steps[0].form.questions[i].jumps.length ?? 0);
    });
    newProject.authors.forEach((author, i) => {
      expect(author.username).toBe(oldProject.authors[i].username);
    });
    newProject.themes.forEach((theme, i) => {
      expect(theme.title).toBe(oldProject.themes[i].title);
    });
    newProject.steps[0].form.analysisConfiguration.unfavourableStatuses.forEach((status, i) => {
      expect(status.name).toBe(
        oldProject.steps[0].form.analysisConfiguration.unfavourableStatuses[i].name,
      );
    });
    expect(newProject.steps[0].form.analysisConfiguration.favourableStatus.name).toBe(
      oldProject.steps[0].form.analysisConfiguration.favourableStatus.name,
    );
  });
});
