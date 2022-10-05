@leaveOrganization @organization
Feature: Leave Organization

@database
Scenario: Member want ot leave organization
  Given I am logged in to graphql as VMD
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: LeaveOrganizationInput!) {
      leaveOrganization(input: $input) {
        organizations {
            id
        }
      }
    }",
    "variables": {
      "input": {
        "organizationId": "T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjI="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"leaveOrganization":{"organizations":[null]}}}
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "query getOrganizations {
      viewer {
        organizations {
          id
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {"data":{"viewer":{"organizations":[]}}}
  """