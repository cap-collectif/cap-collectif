/* eslint-env jest */
const Query_nodeSlug = /* GraphQL */ `
    query nodeSlug($entity: SluggableEntity!, $slug: String!) {
        nodeSlug(entity: $entity, slug: $slug) {
            ...on Organization {
                slug
                title
            }
            ...on GlobalDistrict {
              slug
              name
            }
        }
    }
`;


describe('Internal|Query.nodeSlug', () => {
  it('fetches an organization by its slug', async () => {
    await expect(
      graphql(Query_nodeSlug, {
        entity: "ORGANIZATION",
        slug: "organisation-sans-members"
      }, 'internal'),
    ).resolves.toMatchSnapshot();
  });
  it('fetches a district by its slug', async () => {
    await expect(
      graphql(Query_nodeSlug, {
        entity: "DISTRICT",
        slug: "dervallieres-zola"
      }, 'internal'),
    ).resolves.toMatchSnapshot();
  });
})