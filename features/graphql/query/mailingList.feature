@mailingList @admin
Feature: mailingList

Scenario: GraphQL client wants to get all mailing lists
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      mailingLists {
        totalCount
        edges {
          node {
            name
            owner {
              username
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
    "data":{
      "mailingLists":{
        "totalCount":4,
        "edges":[
          {
            "node":{
              "name":"J'avoue je sers à rien",
              "owner": {
                "username": "Théo QP"
              }
            }
          },
          {
            "node":{
              "name":"liste Solidarité COVID-19",
              "owner": null
            }
          },
          {
            "node":{
              "name":"Liste du projet de Théo",
              "owner": {
                "username": "Théo QP"
              }
            }
          },
          {
            "node":{
              "name":"Les gens qui pèsent dans le capco-game",
              "owner": null
            }
          }
        ]
      }
    }
  }
  """

Scenario: GraphQL client wants to search a list
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      mailingLists(term: \"COVID-19\") {
        totalCount
        edges {
          node {
            name
          }
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "mailingLists":{
        "totalCount":1,
        "edges":[
          {
            "node":{
              "name":"liste Solidarité COVID-19"
            }
          }
        ]
      }
    }
  }
  """

Scenario: GraphQL client wants to search a list, but too soon
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      mailingLists(term: \"COVID-20\") {
        totalCount
        edges {
          node {
            name
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
      "mailingLists": {
        "totalCount":0,
        "edges":[]
      }
    }
  }
  """
