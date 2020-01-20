@project @admin
Feature: updateProjectMetadata

@database
Scenario: GraphQL client wants to update a project metadata
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation UpdateProjectMetadataMutation($input: UpdateProjectInput!) {
      updateProject(input: $input) {
        project {
          id
          title
          publishedAt
          cover {
            id
          }
          video
          themes {
            id
            title
          }
          districts {
            edges {
              node {
                name (locale: FR_FR)
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "UHJvamVjdDpwcm9qZWN0Mg==",
        "publishedAt": "2014-12-30 00:00:00",
        "Cover": "media2",
        "video": "rthwrht",
        "districts": [
          "projectDistrict3",
          "projectDistrict4",
          "projectDistrict5",
          "projectDistrict6",
          "projectDistrict7"
        ],
        "themes": [
          "theme1",
          "theme3"
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProject": {
        "project": {
          "id": "UHJvamVjdDpwcm9qZWN0Mg==",
          "title": "Stratégie technologique de l'Etat et services publics",
          "publishedAt": "2014-12-30 00:00:00",
          "cover": {
            "id": "media2"
          },
          "video": "rthwrht",
          "themes": [
            {
              "title": "Immobilier",
              "id": "theme1"
            },
            {
              "title": "Transport",
              "id": "theme3"
            }
          ],
          "districts": {
            "edges": [
              {
                "node": {
                  "name": "Centre ville",
                  "id": "projectDistrict3"
                }
              },
              {
                "node": {
                  "name": "Îles de Nantes",
                  "id": "projectDistrict4"
                }
              },
              {
                "node": {
                  "name": "Hauts pavés Saint-Félix",
                  "id": "projectDistrict5"
                }
              },
              {
                "node": {
                  "name": "Malakoff Saint-Donation",
                  "id": "projectDistrict6"
                }
              },
              {
                "node": {
                  "name": "Dervallières Zola",
                  "id": "projectDistrict7"
                }
              }
            ]
          }
        }
      }
    }
  }
  """
