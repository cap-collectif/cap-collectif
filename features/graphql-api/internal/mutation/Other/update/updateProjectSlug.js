/* eslint-env jest */
import '../../../../_setup';

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
`;

const input = {
  projectId: 'UHJvamVjdDpwcm9qZWN0MQ==',
  slug: 'toto 1234 éééà',
};

describe('mutations.createEvent', () => {
  it('should update slug', async () => {
    await expect(
      graphql(
        UpdateProjectSlug,
        {
          input,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
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
    ).rejects.toThrowError('Access denied to this field.');
  });
});
