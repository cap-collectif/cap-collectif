/* eslint-env jest */

const HomePageSectionsQuery = /* GraphQL */ `
  query HomePageSections(
    $enabled: Boolean
    $first: Int
    $after: String
    $orderBy: HomePageSectionOrder
  ) {
    homePageSections(
      enabled: $enabled
      first: $first
      after: $after
      orderBy: $orderBy
    ) {
      totalCount
      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
      edges {
        cursor
        node {
          id
          type
          position
          title
          teaser
          body
          nbObjects
          enabled
          displayMode
          metricsToDisplayBasics
          metricsToDisplayEvents
          metricsToDisplayProjects
          centerLatitude
          centerLongitude
          zoomMap
          isLegendEnabledOnImage
        }
      }
    }
  }
`

describe('Internal|Query.homePageSections', () => {
  it('fetches all home page sections (enabled: null)', async () => {
    await global.enableFeatureFlag('calendar')
    await global.enableFeatureFlag('blog')
    await global.enableFeatureFlag('newsletter')
    await global.enableFeatureFlag('themes')
    await expect(
      graphql(HomePageSectionsQuery, { enabled: null }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('fetches only enabled home page sections (enabled: true)', async () => {
    await global.enableFeatureFlag('calendar')
    await global.enableFeatureFlag('blog')
    await global.enableFeatureFlag('newsletter')
    await global.enableFeatureFlag('themes')
    await expect(
      graphql(HomePageSectionsQuery, { enabled: true }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('fetches only disabled home page sections (enabled: false)', async () => {
    await global.enableFeatureFlag('calendar')
    await global.enableFeatureFlag('blog')
    await global.enableFeatureFlag('newsletter')
    await global.enableFeatureFlag('themes')
    await expect(
      graphql(HomePageSectionsQuery, { enabled: false }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('fetches home page sections with pagination (first 3)', async () => {
    await global.enableFeatureFlag('calendar')
    await global.enableFeatureFlag('blog')
    await global.enableFeatureFlag('newsletter')
    await global.enableFeatureFlag('themes')
    await expect(
      graphql(HomePageSectionsQuery, { enabled: null, first: 3 }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('fetches home page sections with pagination (next page)', async () => {
    await global.enableFeatureFlag('calendar')
    await global.enableFeatureFlag('blog')
    await global.enableFeatureFlag('newsletter')
    await global.enableFeatureFlag('themes')
    const firstPage = await graphql(
      HomePageSectionsQuery,
      { enabled: null, first: 3 },
      'internal_admin',
    )
    const endCursor = firstPage.homePageSections.pageInfo.endCursor

    await expect(
      graphql(
        HomePageSectionsQuery,
        { enabled: null, first: 3, after: endCursor },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches home page sections ordered by position DESC', async () => {
    await global.enableFeatureFlag('calendar')
    await global.enableFeatureFlag('blog')
    await global.enableFeatureFlag('newsletter')
    await global.enableFeatureFlag('themes')
    await expect(
      graphql(
        HomePageSectionsQuery,
        {
          enabled: null,
          orderBy: { field: 'POSITION', direction: 'DESC' },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches home page sections ordered by created date DESC', async () => {
    await global.enableFeatureFlag('calendar')
    await global.enableFeatureFlag('blog')
    await global.enableFeatureFlag('newsletter')
    await global.enableFeatureFlag('themes')
    await expect(
      graphql(
        HomePageSectionsQuery,
        {
          enabled: null,
          orderBy: { field: 'CREATED_AT', direction: 'DESC' },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('fetches home page sections ordered by updated date ASC', async () => {
    await global.enableFeatureFlag('calendar')
    await global.enableFeatureFlag('blog')
    await global.enableFeatureFlag('newsletter')
    await global.enableFeatureFlag('themes')
    await expect(
      graphql(
        HomePageSectionsQuery,
        {
          enabled: null,
          orderBy: { field: 'UPDATED_AT', direction: 'ASC' },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
