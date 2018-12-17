@requirements
Feature: mutation updateRequirement

@database
Scenario: Logged in API client wants to accept a requirement
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateRequirementInput!) {
      updateRequirement(input: $input) {
        requirement {
          id
          viewerMeetsTheRequirement
        }
      }
    }",
    "variables": {
      "input": {
        "requirement": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQz",
        "value": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateRequirement": {
        "requirement": {
          "id": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQz",
          "viewerMeetsTheRequirement": true
        }
      }
    }
  }
  """

@database
Scenario: Logged in API client wants to decline a requirement
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateRequirementInput!) {
      updateRequirement(input: $input) {
        requirement {
          id
          viewerMeetsTheRequirement
        }
      }
    }",
    "variables": {
      "input": {
        "requirement": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQz",
        "value": false
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateRequirement": {
        "requirement": {
          "id": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQz",
          "viewerMeetsTheRequirement": false
        }
      }
    }
  }
  """
