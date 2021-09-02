/* eslint-env jest */
import '../../_setup';

const DeleteProjectMutation = /* GraphQL */ `
  mutation DeleteProject($input: DeleteProjectInput!) {
    deleteProject(input: $input) {
      deletedProjectId
    }
  }
`;

describe('Internal|deleteProject mutation', () => {
  it('should delete correctly for amdin', async () => {
    const response = await graphql(
      DeleteProjectMutation,
      {
        input: {
          id: 'UHJvamVjdDpwcm9qZWN0NQ==',
        },
      },
      'internal_admin',
    );

    expect(response.deleteProject.deletedProjectId).toBe('UHJvamVjdDpwcm9qZWN0NQ==');
  });

  it('should delete correctly for project admin if he owns the project', async () => {
    const response = await graphql(
      DeleteProjectMutation,
      {
        input: {
          id: 'UHJvamVjdDpwcm9qZWN0V2l0aE93bmVy',
        },
      },
      'internal_admin',
    );

    expect(response.deleteProject.deletedProjectId).toBe('UHJvamVjdDpwcm9qZWN0V2l0aE93bmVy');
  });

  it('should throw an access denied when project admin user attempt to delete a project that he does not own', async () => {
    await expect(
      graphql(
        DeleteProjectMutation,
        { input: { id: 'UHJvamVjdDpwcm9qZWN0QXJjaGl2ZWQ=' } },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.');
  });

  it('should throw an access denied when questionnaire does not exist', async () => {
    await expect(
      graphql(DeleteProjectMutation, { input: { id: 'abc' } }, 'internal_admin'),
    ).rejects.toThrowError('Access denied to this field.');
  });
});
