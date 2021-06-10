/* eslint-env jest */

const AnalyticsQuery = /* GraphQL */ `
  query Analytics($filter: QueryAnalyticsFilter!) {
    analytics(filter: $filter) {
      registrations {
        values {
          key
          totalCount
        }
      }
      votes {
        values {
          key
          totalCount
        }
      }
      comments {
        values {
          key
          totalCount
        }
      }
      followers {
        values {
          key
          totalCount
        }
      }
      contributions {
        values {
          key
          totalCount
        }
      }
      visitors {
        values {
          totalCount
          key
        }
      }
      trafficSources {
        sources {
          totalCount
          type
        }
      }
      mostVisitedPages {
        values {
          key
          totalCount
        }
      }
      contributors {
        values {
          key
          totalCount
        }
      }
      topContributors {
        user {
          id
        }
      }
      mostUsedProposalCategories {
        values {
          category {
            id
          }
          totalCount
        }
      }
    }
  }
`;

describe('Internal|Analytics', () => {
  it('fetches analytics data', async () => {
    await expect(
      graphql(
        AnalyticsQuery,
        {
          filter: { startAt: '2010-01-01 00:00:00', endAt: '2021-01-01 00:00:00' },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches analytics data by project', async () => {
    await expect(
      graphql(
        AnalyticsQuery,
        {
          filter: {
            startAt: '2010-01-01 00:00:00',
            endAt: '2021-01-01 00:00:00',
            projectId: 'UHJvamVjdDpwcm9qZWN0Ng==',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });
});
