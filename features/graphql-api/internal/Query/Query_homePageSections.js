/* eslint-env jest */

const HomePageSectionsQuery = /* GraphQL */ `
  query HomePageSections($enabled: Boolean, $first: Int, $after: String, $orderBy: HomePageSectionOrder) {
    homePageSections(enabled: $enabled, first: $first, after: $after, orderBy: $orderBy) {
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

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Query.homePageSections', () => {
  it('fetches all home page sections (enabled: null)', async () => {
    await expect(graphql(HomePageSectionsQuery, { enabled: null }, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetches only enabled home page sections (enabled: true)', async () => {
    await expect(graphql(HomePageSectionsQuery, { enabled: true }, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetches only disabled home page sections (enabled: false)', async () => {
    await expect(graphql(HomePageSectionsQuery, { enabled: false }, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('fetches home page sections with pagination (first 3)', async () => {
    await expect(
      graphql(HomePageSectionsQuery, { enabled: null, first: 3 }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('fetches home page sections with pagination (next page)', async () => {
    const firstPage = await graphql(HomePageSectionsQuery, { enabled: null, first: 3 }, 'internal_admin')
    const { endCursor } = firstPage.homePageSections.pageInfo

    await expect(
      graphql(HomePageSectionsQuery, { enabled: null, first: 3, after: endCursor }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('fetches home page sections ordered by position DESC', async () => {
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
})

/**
 * @jest-status compliant
 * @jest-reason Exercises date ordering through the real API with controlled dates and database restoration.
 */
describe('Internal|Query.homePageSections date ordering', () => {
  require('../../_setupDB')

  // Restore the shared fixture baseline even when the last assertion fails.
  afterAll(async () => {
    const execFile = require('util').promisify(require('child_process').execFile)
    await execFile('docker', [
      'exec',
      '-u',
      'capco',
      '-w',
      '/var/www',
      'capco_application_1',
      'bash',
      '-lc',
      process.env.CI_SHARED_TEST_DATA === '1'
        ? 'bash .circleci/profile-mysql-restore.sh'
        : 'mysql -h database -u root symfony < var/db.backup',
    ])
  })

  beforeEach(async () => {
    // These four Section.yaml fixtures have no feature dependencies. Keep the
    // date groups different from position order and reverse them for updatedAt.
    await runSql('UPDATE section SET enabled = 0')
    await runSql(`
      UPDATE section
      SET enabled = 1,
          created_at = CASE id
            WHEN 'sectionIntro' THEN '2020-01-03 00:00:00'
            WHEN 'sectionCustomDisabled' THEN '2020-01-01 00:00:00'
            ELSE '2020-01-02 00:00:00'
          END,
          updated_at = CASE id
            WHEN 'sectionIntro' THEN '2020-02-01 00:00:00'
            WHEN 'sectionCustomDisabled' THEN '2020-02-03 00:00:00'
            ELSE '2020-02-02 00:00:00'
          END
      WHERE id IN ('sectionIntro', 'sectionVideos', 'sectionCustomEnabled', 'sectionCustomDisabled')
    `)
  })

  it.each([
    ['CREATED_AT', 'ASC', ['sectionCustomDisabled', 'sectionCustomEnabled', 'sectionVideos', 'sectionIntro']],
    ['CREATED_AT', 'DESC', ['sectionIntro', 'sectionCustomEnabled', 'sectionVideos', 'sectionCustomDisabled']],
    ['UPDATED_AT', 'ASC', ['sectionIntro', 'sectionCustomEnabled', 'sectionVideos', 'sectionCustomDisabled']],
    ['UPDATED_AT', 'DESC', ['sectionCustomDisabled', 'sectionCustomEnabled', 'sectionVideos', 'sectionIntro']],
  ])('orders by %s %s and breaks date ties by ascending ID', async (field, direction, expectedIds) => {
    const { homePageSections } = await graphql(
      HomePageSectionsQuery,
      { enabled: true, orderBy: { field, direction } },
      'internal_admin',
    )

    expect(homePageSections.totalCount).toBe(4)
    expect(homePageSections.edges.map(({ node }) => node.id)).toEqual(expectedIds)
  })
})
