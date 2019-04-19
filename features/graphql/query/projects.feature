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
            _id
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
            {"node":{"_id":"project1"}},
            {"node":{"_id":"project2"}},
            {"node":{"_id":"project3"}},
            {"node":{"_id":"project4"}},
            {"node":{"_id":"project5"}},
            {"node":{"_id":"project6"}},
            {"node":{"_id":"project7"}},
            {"node":{"_id":"project8"}},
            {"node":{"_id":"project9"}},
            {"node":{"_id":"project10"}},
            {"node":{"_id":"project11"}},
            {"node":{"_id":"project12"}},
            {"node":{"_id":"project13"}},
            {"node":{"_id":"project14"}},
            {"node":{"_id":"project15"}},
            {"node":{"_id":"project16"}},
            {"node":{"_id":"project21"}}
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
      projects(first: 5, orderBy: {field: POPULAR, direction: ASC}) {
        totalCount
        edges {
          node {
            _id
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
            {"node":{"_id":"project1"}},
            {"node":{"_id":"project5"}},
            {"node":{"_id":"project2"}},
            {"node":{"_id":"project3"}},
            {"node":{"_id":"project10"}}
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
        "projects":{
           "edges":[
              {
                 "node":{
                    "id":"UHJvamVjdDpwcm9qZWN0MQ==",
                    "title":"Croissance, innovation, disruption",
                    "themes":[
                       {
                          "id":"theme1"
                       },
                       {
                          "id":"theme2"
                       }
                    ],
                    "author":{
                       "username":"admin"
                    },
                    "type":{
                       "id":"3"
                    },
                    "url":"https:\/\/capco.test\/consultation\/croissance-innovation-disruption\/presentation\/presentation-1",
                    "contributionsCount":254
                 }
              }
           ]
        }
     }
  }
"""
