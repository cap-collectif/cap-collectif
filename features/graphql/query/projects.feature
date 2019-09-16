@projects @read-only
Feature: Projects

Scenario: GraphQL client wants to list projects types filtered by author
  Given I send a GraphQL POST request:
   """
    {
    "query": "query getProjects($authorId: ID!) {
      projects(author: $authorId) {
        totalCount
        edges {
          node {
            title
            authors {
              projects {
                totalCount
              }
            }
          }
        }
      }
    }",
    "variables": {
      "authorId": "VXNlcjp1c2VyQWRtaW4="
    }
  }
  """
  Then the JSON response should match:
  """
    {
      "data":{
        "projects":{
          "totalCount":14,
          "edges":[
            {"node":{"title":"Croissance, innovation, disruption","authors":[{"projects":{"totalCount":14}}]}},
            {"node":{"title":"Strat\u00e9gie technologique de l\u0027Etat et services publics","authors":[{"projects":{"totalCount":14}}]}},
            {"node":{"title":"Transformation num\u00e9rique des relations","authors":[{"projects":{"totalCount":14}}]}},
            {"node":{"title":"Projet vide","authors":[{"projects":{"totalCount":14}}]}},
            {"node":{"title":"D\u00e9pot avec selection vote budget","authors":[{"projects":{"totalCount":14}}]}},
            {"node":{"title":"D\u00e9p\u00f4t avec selection vote simple","authors":[{"projects":{"totalCount":14}}]}},
            {"node":{"title":"Budget avec vote limit\u00e9","authors":[{"projects":{"totalCount":14}}]}},
            {"node":{"title":"Projet sans \u00e9tapes participatives","authors":[{"projects":{"totalCount":14}}]}},
            {"node":{"title":"Projet \u00e0 venir","authors":[{"projects":{"totalCount":14}}]}},
            {"node":{"title":"BP avec vote classement","authors":[{"projects":{"totalCount":14}}]}},
            {"node":{"title":"Le P16 un projet \u00e0 base de riz","authors":[{"projects":{"totalCount":14}}]}},
            {"node":{"title":"Questions\/Responses","authors":[{"projects":{"totalCount":14}},{"projects":{"totalCount":3}}]}},
            {"node":{"title":"Projet externe","authors":[{"projects":{"totalCount":14}}]}},
            {"node":{"title":"Projet externe sans compteur","authors":[{"projects":{"totalCount":14}}]}}
          ]
        }
      }
    }
  """