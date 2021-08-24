/* eslint-env jest */

const EventOwnerEventsQuery = /* GraphQL */ `
  query EventOwnerEventsQuery($affiliations: [EventAffiliation!]) {
    viewer {
      events(affiliations: $affiliations) {
        totalCount
        edges {
          node {
            title
            owner {
              username
            }
          }
        }
      }
    }
  }
`;

const EventOwnerEventsSearchQuery = /* GraphQL */ `
  query EventOwnerEventsSearchQuery($query: String) {
    viewer {
      events(search: $query) {
        totalCount
        edges {
          node {
            id
            title
            owner {
              username
            }
          }
        }
      }
    }
  }
`;

const EventOwnerEventsOrderQuery = /* GraphQL */ `
  query EventOwnerEventsOrderQuery($order: EventOrder) {
    viewer {
      events(orderBy: $order) {
        totalCount
        edges {
          node {
            id
            title
            timeRange {
              startAt
              endAt
            }
          }
        }
      }
    }
  }
`;

const EventOwnerEventsFilterQuery = /* GraphQL */ `
  query EventOwnerEventsFilterQuery($filter: EventStatus) {
    viewer {
      events(status: $filter) {
        totalCount
        edges {
          node {
            id
            title
            reviewStatus
          }
        }
      }
    }
  }
`;

const EventOwnerEventsByAuthorQuery = /* GraphQL */ `
  query EventOwnerEventsByAuthorQuery($id: ID!, $onlyWhenAuthor: Boolean) {
    node(id: $id) {
      ... on User {
        events(onlyWhenAuthor: $onlyWhenAuthor) {
          totalCount
          edges {
            cursor
            node {
              ... on Event {
                id
                title
                author {
                  id
                  username
                }
              }
            }
          }
        }
      }
    }
  }
`;

describe('Internal.EventOwner.events', () => {
  it('should correctly fetch events that a user owns when given the `OWNER` affiliations', async () => {
    const response = await graphql(
      EventOwnerEventsQuery,
      {
        affiliations: ['OWNER'],
      },
      'internal_theo',
    );

    expect(response.viewer.events.totalCount).toBe(1);
    expect(response.viewer.events.edges).toHaveLength(1);
    expect(response.viewer.events.edges[0].node.owner.username).toBe('Théo QP');
  });

  it('should correctly fetch all events if no affiliations given', async () => {
    const response = await graphql(
      EventOwnerEventsQuery,
      {
        affiliations: null,
      },
      'internal_theo',
    );

    expect(response.viewer.events.totalCount).toBe(27);
    expect(response.viewer.events.edges).toHaveLength(27);
  });

  it('should filter by a given query', async () => {
    const response = await graphql(
      EventOwnerEventsSearchQuery,
      {
        query: 'SymfonyLive',
      },
      'internal_admin',
    );

    expect(response.viewer.events.totalCount).toBe(1);
    expect(response.viewer.events.edges).toHaveLength(1);
    expect(response.viewer.events.edges[0].node.title).toBe('SymfonyLive Paris');
  });

  it('should order by a given field and direction ', async () => {
    await expect(
      graphql(
        EventOwnerEventsOrderQuery,
        {
          order: {
            field: 'END_AT',
            direction: 'ASC',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('should filter by `APPROVED` status  ', async () => {
    await expect(
      graphql(
        EventOwnerEventsFilterQuery,
        {
          filter: 'APPROVED',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('should filter by `AWAITING` status  ', async () => {
    await expect(
      graphql(
        EventOwnerEventsFilterQuery,
        {
          filter: 'AWAITING',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('should filter by `REFUSED` status  ', async () => {
    await expect(
      graphql(
        EventOwnerEventsFilterQuery,
        {
          filter: 'REFUSED',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('should filter by `DELETED` status  ', async () => {
    await expect(
      graphql(
        EventOwnerEventsFilterQuery,
        {
          filter: 'DELETED',
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it("fetches a user's events", async () => {
    await Promise.all(
      ['user1', 'user2', 'user3', 'userAdmin', 'user5'].map(async id => {
        await expect(
          graphql(
            EventOwnerEventsByAuthorQuery,
            {
              id: global.toGlobalId('User', id),
              onlyWhenAuthor: true,
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(id);
      }),
    );
  });
});
