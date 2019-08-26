@users @group
Feature: Groups

@database
Scenario: GraphQL client wants to get list of users who are in a group
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query groupUsers ($groupId: ID!,$count: Int, $cursor: String){
      group: node(id: $groupId) {
        ... on Group {
          users(first: $count, after: $cursor) {
            edges {
              cursor
              node {
                id
                _id
              }
            }
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
          }
        }
      }
    }",
    "variables": {
      "groupId": "group3",
      "count": 32,
      "cursor": null
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "group":{
           "users":{
              "edges":[
                 {
                    "cursor":"YXJyYXljb25uZWN0aW9uOjA=",
                    "node":{
                       "id":"VXNlcjp1c2VyMg==",
                       "_id":"user2"
                    }
                 },
                 {
                    "cursor":"YXJyYXljb25uZWN0aW9uOjE=",
                    "node":{
                       "id":"VXNlcjp1c2VyMTAw",
                       "_id":"user100"
                    }
                 },
                @...@
              ],
              "pageInfo":{
                 "hasPreviousPage":false,
                 "hasNextPage":true,
                 "startCursor":"YXJyYXljb25uZWN0aW9uOjA=",
                 "endCursor":"YXJyYXljb25uZWN0aW9uOjMx"
              }
           }
        }
     }
  }
  """
