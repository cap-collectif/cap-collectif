@projects @read-only
Feature: Projects

Scenario: GraphQL client wants to list projects by latest 
  Given I send a GraphQL POST request:
  """
  {
    "query": "{
      projects(orderBy: {field: LATEST, direction: ASC}) {
        totalCount
        edges {
          node {
            id
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
        "projects": {
          "totalCount":17,
          "edges": [
            {"node":{"id":"project1"}},
            {"node":{"id":"project2"}},
            {"node":{"id":"project3"}},
            {"node":{"id":"project4"}},
            {"node":{"id":"project5"}},
            {"node":{"id":"project6"}},
            {"node":{"id":"project7"}},
            {"node":{"id":"project8"}},
            {"node":{"id":"project9"}},
            {"node":{"id":"project10"}},
            {"node":{"id":"project11"}},
            {"node":{"id":"project12"}},
            {"node":{"id":"project13"}},
            {"node":{"id":"project14"}},
            {"node":{"id":"project15"}},
            {"node":{"id":"project16"}},
            {"node":{"id":"project21"}}
          ]
        }
      }
    }
  """

Scenario: GraphQL client wants to list projects order by popularity
  Given I send a GraphQL POST request:
  """
  {
    "query": "{
      projects(orderBy: {field: POPULAR, direction: ASC}) {
        totalCount
        edges {
          node {
            id
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
      "projects":{
      "totalCount":17,
         "edges":[
            {"node":{"id":"project1"}},
            {"node":{"id":"project5"}},
            {"node":{"id":"project6"}},
            {"node":{"id":"project2"}},
            {"node":{"id":"project8"}},
            {"node":{"id":"project15"}},
            {"node":{"id":"project3"}},
            {"node":{"id":"project7"}},
            {"node":{"id":"project10"}},
            {"node":{"id":"project11"}},
            {"node":{"id":"project21"}},
            {"node":{"id":"project9"}},
            {"node":{"id":"project12"}},
            {"node":{"id":"project13"}},
            {"node":{"id":"project14"}},
            {"node":{"id":"project16"}},
            {"node":{"id":"project4"}}
            ]
         }
      }
   }
"""

Scenario: GraphQL client wants to get a project with specify term, theme and type
  Given I send a GraphQL POST request:
   """
  {
    "query": "query getProjects($term: String, $theme: ID, $type: ID) {
      projects(term: $term, theme: $theme, type: $type) {
        edges {
          node {
            id
            title
            themes {
              id
            }
            author {
              username
            }
            type {
              id
            }
            url
            contributionsCount
          }
        }
      }
    }",
    "variables": {
      "term": "Croissance",
      "theme": "theme1",
      "type": "3"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "projects":
        {
        "edges":[
            {
            "node":{
              "id":"project1","title":"Croissance, innovation, disruption",
              "themes":[{"id":"theme1"},{"id":"theme2"}],
              "author":{"username":"admin"},
              "type":{"id":"3"},
              "url":"https:\/\/capco.test\/consultation\/croissance-innovation-disruption\/presentation\/presentation",
              "contributionsCount":246
            }
          }
        ]
      }
    }
  }
"""
