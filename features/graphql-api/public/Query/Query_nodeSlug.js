/* eslint-env jest */

const Query_nodeSlugOrganization = /* GraphQL */ `
  query nodeSlugOrganization($entity: SluggableEntity!, $slug: String!) {
    nodeSlug(entity: $entity, slug: $slug) {
      ... on Organization {
        translationBySlug(slug: $slug) {
          title
          body
          locale
        }
      }
    }
  }
`

const Query_nodeSlugGlobalDistrict = /* GraphQL */ `
  query nodeSlugGlobalDistrict($entity: SluggableEntity!, $slug: String!) {
    nodeSlug(entity: $entity, slug: $slug) {
      ... on GlobalDistrict {
        id
        geojson
        cover {
          url(format: "reference")
        }
        translationBySlug(slug: $slug) {
          name
          titleOnMap
          description
          locale
        }
      }
    }
  }
`

const Query_nodeSlugProposalDistrict = /* GraphQL */ `
  query nodeSlugProposalDistrict($entity: SluggableEntity!, $slug: String!) {
    nodeSlug(entity: $entity, slug: $slug) {
      ... on ProposalDistrict {
        id
        geojson
        cover {
          url(format: "reference")
        }
        translationBySlug(slug: $slug) {
          name
          titleOnMap
          description
          locale
        }
      }
    }
  }
`

const Query_nodeSlugPage = /* GraphQL */ `
  query nodeSlugPage($entity: SluggableEntity!, $slug: String!) {
    nodeSlug(entity: $entity, slug: $slug) {
      ... on Page {
        media {
          width
          height
        }
        customCode
        translationBySlug(slug: $slug) {
          title
          body
          metaDescription
          locale
        }
      }
    }
  }
`

describe('Internal|Query.nodeSlug', () => {
  it('fetches an organization by its slug FR', async () => {
    await expect(
      graphql(
        Query_nodeSlugOrganization,
        {
          entity: 'ORGANIZATION',
          slug: 'organisation-sans-members',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('fetches an organization by its slug EN', async () => {
    await expect(
      graphql(
        Query_nodeSlugOrganization,
        {
          entity: 'ORGANIZATION',
          slug: 'organization-without-members',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('fetches a district by its slug FR', async () => {
    await expect(
      graphql(
        Query_nodeSlugGlobalDistrict,
        {
          entity: 'DISTRICT',
          slug: 'premier-quartier',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('fetches a district by its slug EN', async () => {
    await expect(
      graphql(
        Query_nodeSlugGlobalDistrict,
        {
          entity: 'DISTRICT',
          slug: 'first-district',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('fetches a proposal district by its slug FR', async () => {
    await expect(
      graphql(
        Query_nodeSlugProposalDistrict,
        {
          entity: 'PROPOSAL_DISTRICT',
          slug: 'paris-1iere-arrondissement',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('fetches a proposal district by its slug EN', async () => {
    await expect(
      graphql(
        Query_nodeSlugProposalDistrict,
        {
          entity: 'PROPOSAL_DISTRICT',
          slug: 'paris-1st-arrondissement',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('fetches a custom page by its slug FR', async () => {
    await expect(
      graphql(
        Query_nodeSlugPage,
        {
          entity: 'PAGE',
          slug: 'faq',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('fetches a custom page by its slug EN', async () => {
    await expect(
      graphql(
        Query_nodeSlugPage,
        {
          entity: 'PAGE',
          slug: 'faq-en',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
