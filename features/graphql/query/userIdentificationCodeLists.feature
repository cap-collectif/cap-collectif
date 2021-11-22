@userIdentificationCode @admin
Feature: userIdentificationCode

Scenario: GraphQL client wants to get lists but is not admin
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      viewer {
        userIdentificationCodeLists {
          totalCount
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "extensions": {
      "warnings": [
        {
          "message": "Access denied to this field.",
          "@*@": "@*@"
        },
        @...@
      ]
    }
  }
  """

Scenario: GraphQL admin wants to get lists
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      viewer {
        userIdentificationCodeLists {
          totalCount
          edges {
            node {
              id
              name
              codesCount
              alreadyUsedCount
            }
          }
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "viewer": {
        "userIdentificationCodeLists": {
          "totalCount": 1,
          "edges": [
            {
              "node": {
                "id": @string@,
                "name": "Nouvelle Liste",
                "codesCount": 2,
                "alreadyUsedCount": 1
              }
            }
          ]
        }
      }
    }
  }
  """