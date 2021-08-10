/* eslint-env jest */
import '../../_setup';

const CreateProjectMutation = /* GraphQL */ `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      project {
        id
        authors {
          username
        }
        visibility
      }
    }
  }
`;

const BASE_INPUT = {
  projectType: '1',
  title: 'Le super project',
};

describe('createProject', () => {
  describe('visibility', () => {
    it('should create by default a project visibility set to `ME` when user is a project admin', async () => {
      const response = await graphql(
        CreateProjectMutation,
        { input: { ...BASE_INPUT, authors: [] } },
        'internal_theo',
      );
      expect(response.createProject.project.visibility).toStrictEqual('ME');
    });
    it('should create by default a project visibility set to `ADIMN` when user is an admin', async () => {
      const response = await graphql(
        CreateProjectMutation,
        { input: { ...BASE_INPUT, authors: [toGlobalId('User', 'userTheo')] } },
        'internal_admin',
      );
      expect(response.createProject.project.visibility).toStrictEqual('ADMIN');
    });
  });
  describe('authors', () => {
    it('should set the author to the user that created the project when user is project admin and no authors have been provided', async () => {
      const response = await graphql(
        CreateProjectMutation,
        { input: { ...BASE_INPUT, authors: [] } },
        'internal_theo',
      );
      expect(response.createProject.project.authors).toHaveLength(1);
      expect(response.createProject.project.authors[0].username).toStrictEqual('Théo QP');
    });
    it('should throw an error when user is an admin and no authors have been provided', async () => {
      await expect(
        graphql(CreateProjectMutation, { input: { ...BASE_INPUT, authors: [] } }, 'internal_admin'),
      ).rejects.toThrowError('You must specify at least one author.');
    });
  });
});
