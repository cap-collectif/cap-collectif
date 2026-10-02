/* eslint-env jest */
import '../../../../_setupDB'

const DeleteProjectMutation = /* GraphQL */ `
  mutation DeleteProject($input: DeleteProjectInput!) {
    deleteProject(input: $input) {
      deletedProjectId
    }
  }
`

describe('Internal|deleteProject mutation', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
  it('should delete correctly for amdin', async () => {
    const response = await graphql(
      DeleteProjectMutation,
      {
        input: {
          id: 'UHJvamVjdDpwcm9qZWN0NQ==',
        },
      },
      'internal_admin',
    )

    expect(response.deleteProject.deletedProjectId).toBe('UHJvamVjdDpwcm9qZWN0NQ==')
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
  it('should delete correctly for project admin if he owns the project', async () => {
    const response = await graphql(
      DeleteProjectMutation,
      {
        input: {
          id: 'UHJvamVjdDpwcm9qZWN0V2l0aE93bmVy',
        },
      },
      'internal_theo',
    )

    expect(response.deleteProject.deletedProjectId).toBe('UHJvamVjdDpwcm9qZWN0V2l0aE93bmVy')
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('should throw an access denied when project admin user attempt to delete a project that he does not own', async () => {
    await expect(
      graphql(DeleteProjectMutation, { input: { id: 'UHJvamVjdDpwcm9qZWN0QXJjaGl2ZWQ=' } }, 'internal_theo'),
    ).rejects.toThrowError('Access denied to this field.')
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('should throw an access denied when questionnaire does not exist', async () => {
    await expect(graphql(DeleteProjectMutation, { input: { id: 'abc' } }, 'internal_admin')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
