/* eslint-env jest */
const OpenDataEventsQuery = /* GraphQL */ `
  query OpenDataEventsQuery($count: Int!, $cursor: String, $orderBy: EventOrder) {
    events(first: $count, after: $cursor, orderBy: $orderBy) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          createdAt
          updatedAt
          startAt
          endAt
          enabled
          fullAddress
          lat
          lng
          zipCode
          body
          url
          link
          author {
            id
            userType {
              name
            }
            responses {
              edges {
                node {
                  ... on ValueResponse {
                    value
                    formattedValue
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const PublicOrderdedEventsQuery = /* GraphQL */ `
  query PublicOrderdedEventsQuery($count: Int!, $cursor: String, $orderBy: EventOrder) {
    events(first: $count, after: $cursor, orderBy: $orderBy) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          startAt
          endAt
        }
      }
    }
  }
`;

const InternalEventsQuery = /* GraphQL */ `
  query InternalEventsQuery(
    $count: Int!
    $cursor: String
    $orderBy: EventOrder
    $isFuture: Boolean
  ) {
    events(first: $count, after: $cursor, orderBy: $orderBy, isFuture: $isFuture) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          themes {
            id
          }
          projects {
            id
          }
        }
      }
    }
  }
`;

describe('Preview|Query.events connection', () => {
  it('fetches the first hundred events with a cursor', async () => {
    await expect(graphql(OpenDataEventsQuery, { count: 100 })).resolves.toMatchSnapshot();
  });

  it('fetches the 3 events ordered by last start date with a cursor', async () => {
    await expect(
      graphql(PublicOrderdedEventsQuery, {
        count: 3,
        orderBy: { field: 'START_AT', direction: 'DESC' },
      }),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the 3 events ordered by first start date with a cursor', async () => {
    await expect(
      graphql(PublicOrderdedEventsQuery, {
        count: 3,
        orderBy: { field: 'START_AT', direction: 'ASC' },
      }),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the 3 events ordered by last end date with a cursor', async () => {
    await expect(
      graphql(PublicOrderdedEventsQuery, {
        count: 3,
        orderBy: { field: 'END_AT', direction: 'DESC' },
      }),
    ).resolves.toMatchSnapshot();
  });

  it('fetches the 3 events ordered by first end date with a cursor', async () => {
    await expect(
      graphql(PublicOrderdedEventsQuery, {
        count: 3,
        orderBy: { field: 'END_AT', direction: 'ASC' },
      }),
    ).resolves.toMatchSnapshot();
  });

  it('fetches only future events with a cursor', async () => {
    await expect(
      graphql(InternalEventsQuery, { count: 100, isFuture: true }, 'internal'),
    ).resolves.toMatchSnapshot();
  });

  it('fetches only passed events with a cursor', async () => {
    await expect(
      graphql(InternalEventsQuery, { count: 100, isFuture: false }, 'internal'),
    ).resolves.toMatchSnapshot();
  });

  it('fetches only events associated to a project with a cursor', async () => {
    await expect(
      graphql(
        InternalEventsQuery,
        { count: 100, project: toGlobalId('Project', 'project1') },
        'internal',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('fetches only events associated to a theme with a cursor', async () => {
    await expect(
      graphql(InternalEventsQuery, { count: 100, theme: 'theme2' }, 'internal'),
    ).resolves.toMatchSnapshot();
  });

  it('fetches only events matching a specific term with a cursor', async () => {
    await expect(
      graphql(InternalEventsQuery, { count: 100, search: 'registrations' }, 'internal'),
    ).resolves.toMatchSnapshot();
  });
});
