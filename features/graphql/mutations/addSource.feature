@addSource
Feature: Add Source

@database
Scenario: User wants to add a source on an opinion
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddSourceInput!) {
      addSource(input: $input) {
        source {
          id
          body
          author {
            id
          }
        }
        sourceEdge {
          cursor
          node {
            id
          }
        }
      }
    }",
    "variables": {
      "input": {
        "sourceableId": "opinion1",
        "link": "http://google.com",
        "title": "Je suis une source",
        "body": "<div>Jai un corps mais pas de bras :'(</div>",
        "category": "category2"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addSource": {
          "source": {
              "id": @uuid@,
              "body": "Tololo",
              "author": {
                "id": "user5"
              }
          },
          "sourceEdge": {
              "cursor": "YXJyYXljb25uZWN0aW9uOjA=",
              "node": {
                "id": @uuid@
              }
          }
       }
     }
  }
  """
