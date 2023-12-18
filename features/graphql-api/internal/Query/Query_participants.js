//* eslint-env jest */
const ParticipantsQuery = /* GraphQL */ `
  query ParticipantsQuery(
    $count: Int
    $cursor: String
  ) {
    participants(first: $count, after: $cursor) {
      totalCount
      edges {
        node {
          id
          firstname
          __typename
        }
        cursor
      }
    }
  }
`;

const variables = {
  "count": 16,
  "cursor": null,
}

describe('Internal|Query participants', () => {
  it('fetches all participants', async () => {
    await expect(graphql(ParticipantsQuery, variables, 'internal_admin')).resolves.toMatchSnapshot();
  });
});
