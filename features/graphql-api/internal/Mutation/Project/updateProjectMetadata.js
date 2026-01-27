/* eslint-env jest */
import '../../../_setupDB'

const UpdateProjectMetadataMutation = /* GraphQL*/ `
    mutation UpdateProjectMetadataMutation($input: UpdateProjectInput!) {
      updateProject(input: $input) {
        project {
          id
          title
          publishedAt
          cover {
            id
          }
          video
          themes {
            id
            title
          }
          districts {
            edges {
              node {
                name (locale: FR_FR)
                id
              }
            }
          }
        }
      }
    }
`

describe('mutations.updateProjectMetadataMutation', () => {
  it('GraphQL admin wants to update a project metadata', async () => {
    await expect(
      graphql(
        UpdateProjectMetadataMutation,
        {
          input: {
            id: 'UHJvamVjdDpwcm9qZWN0Mg==',
            publishedAt: '2014-12-30 00:00:00',
            cover: 'media2',
            video: 'rthwrht',
            districts: [
              'RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qz',
              'RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Q0',
              'RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Q1',
              'RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Q2',
              'RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Q3',
            ],
            themes: ['theme1', 'theme3'],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
