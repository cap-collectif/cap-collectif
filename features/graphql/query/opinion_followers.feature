@opinion_follow @opinion_follow_graphql
Feature: Opinions

@database
Scenario: GraphQL client wants to get list of users who following an opinion
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query getFollowers ($opinionId: ID!,$count: Int, $cursor: String){
      opinion: node(id: $opinionId) {
        ... on Opinion {
          followers(first: $count, after: $cursor, orderBy: {field: NAME, direction: ASC}) {
            edges {
              cursor
              node {
                _id
              }
            }
            totalCount
          }
        }
      }
    }",
    "variables": {
      "opinionId": "opinion6",
      "count": 2,
      "cursor": null
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "opinion": {
        "followers": {
          "edges": [
            {
              "cursor": @string@,
              "node": {
                "_id": "user5"
              }
            },{
              "cursor": @string@,
              "node": {
                "_id": "user10"
              }
            }
          ],
          "totalCount": 37
        }
      }
    }
  }
  """

@database
Scenario: I'm on qqa opinion and I want to load 20 followers from a cursor
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($opinionId: ID!, $count: Int, $cursor: String) {
      opinion: node(id: $opinionId) {
        id
        ... on Opinion {
          followers(first: $count, after: $cursor) {
            edges {
              cursor
              node {
                id
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
            totalCount
          }
        }
      }
    }",
    "variables": {
      "opinionId": "opinion6",
      "count": 20,
      "cursor": "YXJyYXljb25uZWN0aW9uOjMa"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "opinion": {
        "id": "opinion6",
        "followers": {
          "edges": [
            {
              "cursor": @string@,
              "node": {
                "id": @string@
              }
            },
            @...@
          ],
          "pageInfo": {
            "hasNextPage": true,
            "endCursor": @string@
          },
          "totalCount": 37
        }
      }
    }
  }
  """

Scenario: GraphQL client tries to access to the followers of an opinion inside a non-followable project
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($opinionId: ID!, $count: Int, $cursor: String) {
      opinion: node(id: $opinionId) {
        id
        ... on Opinion {
          followers(first: $count, after: $cursor) {
            edges {
              cursor
              node {
                id
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
            totalCount
          }
        }
      }
    }",
    "variables": {
      "opinionId": "opinion57",
      "count": 20
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "opinion": {
        "id": "opinion57",
        "followers": null
      }
    }
  }
  """
