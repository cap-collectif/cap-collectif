@shield
Feature: Shield configuration

Scenario: GraphQL admin client wants to get current configuration of shield
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      shieldAdminForm {
        shieldMode
        introduction
        image {
          id
          name
          url
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data":
    {
      "shieldAdminForm":
      {
        "shieldMode": @boolean@,
        "introduction": @string@,
        "image":
        {
          "id": @string@,
          "name": @string@,
          "url": @string@
        }
      }
    }
  }
  """
