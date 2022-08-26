@addOrganization @organization @admin
Feature: Add Organization

@database
Scenario: Admin wants to add an organization
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddOrganizationInput!) {
      addOrganization(input: $input) {
        organization {
            id
        }
      }
    }",
    "variables": {
      "input": {
        "title": "My awesome organization"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addOrganization": {
        "organization": {
          "id": @string@
        }
      }
    }
  }
  """