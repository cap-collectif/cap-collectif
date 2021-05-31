@registerEmailDomains
Feature: RegisterEmailDomains

@database
Scenario: Anonymous GraphQL attempt to register new domains
  Given I am logged out
  And I send a GraphQL POST request:
"""
{
  "query": "mutation RegisterEmailDomainsMutation($input: RegisterEmailDomainsInput!) {
      registerEmailDomains(input: $input) {
      domains {
        value
      }
    }
  }",
  "variables": {
    "input": {
      "domains": [
        {
          "value": "gmail.com"
        },
        {
          "value": "capco.com"
        }
      ]
    }
  }
}
"""
  Then the JSON response should match:
"""
{
  "errors": [
    {"message":"Access denied to this field.","@*@": "@*@"}
  ],
  "data": {
    "registerEmailDomains": null
  }
}
"""

@database
Scenario: GraphQL client wants to register new domains
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation RegisterEmailDomainsMutation($input: RegisterEmailDomainsInput!) {
        registerEmailDomains(input: $input) {
        domains {
          value
        }
      }
    }",
    "variables": {
      "input": {
        "domains": [
          {
            "value": "gmail.com"
          },
          {
            "value": "capco.com"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
    {
      "data": {
        "registerEmailDomains": {
          "domains": [
            {
              "value": "gmail.com"
            },
            {
              "value": "capco.com"
            }
          ]
        }
      }
    }
  """
