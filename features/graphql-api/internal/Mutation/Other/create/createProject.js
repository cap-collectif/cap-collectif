/* eslint-env jest */
import '../../../../_setupDB'

const CreateProjectMutation = /* GraphQL */ `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      project {
        id
        authors {
          username
        }
        owner {
          username
        }
        visibility
      }
    }
  }
`

const BASE_INPUT = {
  projectType: '1',
  title: 'Le super project',
}

describe('createProject', () => {
  describe('visibility', () => {
    it('should create by default a project visibility set to `ME` when user is a project admin', async () => {
      const response = await graphql(CreateProjectMutation, { input: { ...BASE_INPUT, authors: [] } }, 'internal_theo')
      expect(response.createProject.project.visibility).toStrictEqual('ME')
    })
    it('should create by default a project visibility set to `ADIMN` when user is an admin', async () => {
      const response = await graphql(
        CreateProjectMutation,
        { input: { ...BASE_INPUT, authors: [toGlobalId('User', 'userTheo')] } },
        'internal_admin',
      )
      expect(response.createProject.project.visibility).toStrictEqual('ADMIN')
    })
  })
  describe('authors', () => {
    it('should set the author to the user that created the project when user is project admin and no authors have been provided', async () => {
      const response = await graphql(CreateProjectMutation, { input: { ...BASE_INPUT, authors: [] } }, 'internal_theo')
      expect(response.createProject.project.authors).toHaveLength(1)
      expect(response.createProject.project.authors[0].username).toStrictEqual('Théo QP')
    })
    it('should throw an error when user is an admin and no authors have been provided', async () => {
      await expect(
        graphql(CreateProjectMutation, { input: { ...BASE_INPUT, authors: [] } }, 'internal_admin'),
      ).rejects.toThrowError('You must specify at least one author.')
    })
    it('should create a project when the user is a project admin', async () => {
      const response = await graphql(CreateProjectMutation, { input: { ...BASE_INPUT, authors: [] } }, 'internal_theo')
      expect(response.createProject.project.owner.username).toStrictEqual('Théo QP')
    })
  })

  it('GraphQL client wants to create a project', async () => {
    await expect(
      graphql(
        CreateProjectMutation,
        {
          input: {
            title: 'thisisnotatest',
            authors: ['VXNlcjp1c2VyQWRtaW4=', 'VXNlcjp1c2VyMQ=='],
            projectType: '2',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createProject: {
        project: {
          id: expect.any(String),
        },
      },
    })
  })

  it('GraphQL client wants to create a project without type', async () => {
    await expect(
      graphql(
        CreateProjectMutation,
        {
          input: {
            title: 'thisisnotatest',
            authors: ['VXNlcjp1c2VyQWRtaW4=', 'VXNlcjp1c2VyMQ=='],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createProject: {
        project: {
          id: expect.any(String),
        },
      },
    })
  })

  it('GraphQL client wants to create a project without authors', async () => {
    await expect(
      graphql(
        CreateProjectMutation,
        {
          input: {
            title: 'thisisnotatest',
            authors: [],
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('You must specify at least one author')
  })

  it('GraphQL client wants to create a project in english', async () => {
    await expect(
      graphql(
        CreateProjectMutation,
        {
          input: {
            title: 'thisisnotatest',
            authors: ['VXNlcjp1c2VyQWRtaW4=', 'VXNlcjp1c2VyMQ=='],
            projectType: '2',
            locale: 'locale-en-GB',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      createProject: {
        project: {
          id: expect.any(String),
        },
      },
    })
  })
})
