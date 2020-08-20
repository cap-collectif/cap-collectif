@consultations
Feature: Consultations

Scenario: GraphQL client wants to list contributions in a section
  When I send a GraphQL request:
  """
  query {
    section: node(id: "opinionType5") {
      ... on Section {
        contributionConnection(first: 5, orderBy: {field: VOTE_COUNT, direction: DESC}) {
          totalCount
          edges {
            cursor
            node {
              ... on Opinion {
                title
              }
            }
          }
        }
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
  "data": {
    "section": {
      "contributionConnection": {
        "totalCount": @integer@,
        "edges": [
          {
            "cursor": @string@,
            "node": {
              "title": @string@
            }
          },
          @...@
        ]
      }
    }
  }
  }
  """
