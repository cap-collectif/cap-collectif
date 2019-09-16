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
    "data": {
      "projects": {
        "totalCount": 15,
        "edges": [
          {
            "node": {
              "title": "Croissance, innovation, disruption",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Stratégie technologique de l'Etat et services publics",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Transformation numérique des relations",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Projet vide",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Dépot avec selection vote budget",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Dépôt avec selection vote simple",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Budget avec vote limité",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Projet sans étapes participatives",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Projet à venir",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "BP avec vote classement",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Le P16 un projet à base de riz",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Questions/Responses",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                },
                {
                  "projects": {
                    "totalCount": 3
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Projet externe",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Projet externe sans compteur",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          },
          {
            "node": {
              "title": "Projet avec beaucoup d'opinions",
              "authors": [
                {
                  "projects": {
                    "totalCount": 15
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }
  """
