/* eslint-env jest */
import '../../../../_setupDB'

const UpdateProjectSlug = /* GraphQL*/ `
    mutation UpdateProjectSlugMutation(
        $input: UpdateProjectSlugInput!
    ) {
        updateProjectSlug(input: $input) {
            project {
                slug
                url
            }
            errorCode
        }
    }
`

const input = {
  projectId: 'UHJvamVjdDpwcm9qZWN0MQ==',
  slug: 'toto 1234 éééà',
}

describe('mutations.createEvent', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should update slug', async () => {
    await expect(
      graphql(
        UpdateProjectSlug,
        {
          input,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('should return PROJECT_NOT_FOUND errorCode', async () => {
    await expect(
      graphql(
        UpdateProjectSlug,
        {
          input: {
            ...input,
            projectId: 'abc',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
