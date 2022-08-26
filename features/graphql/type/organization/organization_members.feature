@organization
Feature: Organisation members

Scenario: GraphQL admin wants to get all members of an organization
  Given I am logged in to graphql as admin
  And I send a GraphQL request:
  """
  query {
    organization: node(id: "T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjE=") {
    ... on Organization {
        title
        members {
          user {
            username
          }
          role
        }
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "organization": {
        "title": "Communauté de commune de Parthenay",
        "members": [
            {
                "user": {
                    "username": "sfavot"
                },
                "role": "USER"
            },
            {
                "user": {
                    "username": "lbrunet"
                },
                "role": "ADMIN"
            },
            {
                "user": {
                    "username": "admin"
                },
                "role": "USER"
            },
            {
                "user": {
                    "username": "user"
                },
                "role": "USER"
            }
        ]
      }
    }
  }
  """

Scenario: GraphQL user not organization admin wants to get all members of an organization
  Given I am logged in to graphql as theo
  And I send a GraphQL request:
  """
  query {
    organization: node(id: "T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjE=") {
    ... on Organization {
        title
        members {
          user {
            username
          }
          role
        }
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "organization": {
        "title": "Communauté de commune de Parthenay",
        "members": @null@
      }
    }
  }
  """

Scenario: GraphQL anonymous wants to get all members of an organization
  And I send a GraphQL request:
  """
  query {
    organization: node(id: "T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjE=") {
    ... on Organization {
        title
        members {
          user {
            username
          }
          role
        }
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "organization": {
        "title": "Communauté de commune de Parthenay",
        "members": @null@
      }
    }
  }
  """