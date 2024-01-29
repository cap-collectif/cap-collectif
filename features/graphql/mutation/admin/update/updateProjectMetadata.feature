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
        "cover": "media2",
        "video": "rthwrht",
        "districts": [
          "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qz",
          "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Q0",
          "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Q1",
          "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Q2",
          "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Q3"
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
                  "id": "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qz"
                }
              },
              {
                "node": {
                  "name": "Îles de Nantes",
                  "id": "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Q0"
                }
              },
              {
                "node": {
                  "name": "Hauts pavés Saint-Félix",
                  "id": "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Q1"
                }
              },
              {
                "node": {
                  "name": "Malakoff Saint-Donation",
                  "id": "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Q2"
                }
              },
              {
                "node": {
                  "name": "Dervallières Zola",
                  "id": "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Q3"
                }
              }
            ]
          }
        }
      }
    }
  }
  """
