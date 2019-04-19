@section
Feature: Opinion types

@read-only 
Scenario: GraphQL client wants to list consultations ordered by positions
  When I send a GraphQL request:
  """
  query {
    node(id: "opinionType10") {
      ... on Section {
        opinions(first: 25, orderBy: {field: POSITIONS, direction: DESC}) {
          totalCount
          edges {
            node {
              id
              pinned
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
     "data":{
        "node": {
        "opinions": {
          "totalCount": 3,
          "edges": [
            { 
              "node": {
                 "id": @string@,
                 "pinned": @boolean@
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """

@read-only
Scenario: GraphQL client wants to list consultations ordered by votes
  When I send a GraphQL request:
  """
  query {
    node(id: "opinionType10") {
      ... on Section {
        opinions(first: 25, orderBy: {field: VOTES, direction: DESC}) {
          totalCount
          edges {
            node {
              id
              pinned
              votes {
                totalCount
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
     "data":{
        "node": {
        "opinions": {
          "totalCount": 3,
          "edges": [
            { 
              "node": {
                 "id": @string@,
                 "pinned": @boolean@,
                 "votes": {
                    "totalCount": @integer@
                  }
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """

@read-only
Scenario: GraphQL client wants to list consultations ordered by favorites
  When I send a GraphQL request:
  """
  query {
    node(id: "opinionType10") {
      ... on Section {
        opinions(first: 25, orderBy: {field: VOTES_OK, direction: DESC}) {
          totalCount
          edges {
            node {
              id
              pinned
              votes(value: YES) {
                totalCount
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
     "data":{
        "node": {
        "opinions": {
          "totalCount": 3,
          "edges": [
            { 
              "node": {
                 "id": @string@,
                 "pinned": @boolean@,
                 "votes": {
                    "totalCount": @integer@
                  }
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """

@read-only
Scenario: GraphQL client wants to list consultations ordered by comments
  When I send a GraphQL request:
  """
  query {
    node(id: "opinionType10") {
      ... on Section {
        opinions(first: 25, orderBy: {field: COMMENTS, direction: DESC}) {
          totalCount
          edges {
            node {
              id
              pinned
              arguments {
                totalCount
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
     "data":{
        "node": {
        "opinions": {
          "totalCount": 3,
          "edges": [
            { 
              "node": {
                 "id": @string@,
                 "pinned": @boolean@,
                 "arguments": {
                    "totalCount": @integer@
                  }
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """
