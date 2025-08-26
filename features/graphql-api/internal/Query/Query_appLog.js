/* eslint-env jest */
/* eslint-disable flowtype/require-valid-file-annotation */
const appLogQuery = /* GraphQL */ `
  query (
    $actionType: LogActionType
    $userRole: AppLogUserRole
    $term: String
    $dateRange: DateRange
    $orderBy: AppLogOrder
  ) {
    appLog(
      actionType: $actionType
      userRole: $userRole
      term: $term
      orderBy: $orderBy
      dateRange: $dateRange
    ) {
      edges {
        node {
          user {
            username
          }
          description
          ip
          createdAt
          actionType
        }
      }
      newestLoggedAt
      oldestLoggedAt
    }
  }
`;

describe('Query.appLog connection', () => {
  it('fetches app logs without arguments', async () => {
    await expect(graphql(appLogQuery, {}, 'internal_super_admin')).resolves.toMatchSnapshot();
  });

  it('fetches app logs with SHOW action type', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          actionType: 'SHOW',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with CREATE action type', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          actionType: 'CREATE',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with DELETE action type', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          actionType: 'DELETE',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with EDIT action type', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          actionType: 'EDIT',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with EXPORT action type', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          actionType: 'EXPORT',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with dates between startedAt and endedAt', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          dateRange: {
            startedAt: '2025-01-01',
            endedAt: '2025-06-01',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with created_at order DESC', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          orderBy: {
            field: 'CREATED_AT',
            direction: 'DESC',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with SUPER_ADMIN user role', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          userRole: 'ROLE_SUPER_ADMIN',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with ADMIN user role', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          userRole: 'ROLE_ADMIN',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with all arguments', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          term: 'Page liste des',
          orderBy: {
            field: 'CREATED_AT',
            direction: 'DESC',
          },
          userRole: 'ROLE_SUPER_ADMIN',
          dateRange: {
            startedAt: '2025-01-01',
            endedAt: '2025-01-06',
          },
          actionType: 'SHOW',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with username term', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          term: 'lbrunet',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with user email term', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          term: 'lbrunet@cap-collectif.com',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with ip term', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          term: '127.0.0.2',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with ORGANIZATION_ADMIN', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          userRole: 'ORGANIZATION_ADMIN',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches app logs with ORGANIZATION_MEMBER', async () => {
    await expect(
      graphql(
        appLogQuery,
        {
          userRole: 'ORGANIZATION_MEMBER',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
