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
            value: id
            label: title
            id
          }
          districts {
            edges {
              node {
                value: id
                label: name
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
              "value": "theme1",
              "label": "Immobilier",
              "id": "theme1"
            },
            {
              "value": "theme3",
              "label": "Transport",
              "id": "theme3"
            }
          ],
          "districts": {
            "edges": [
              {
                "node": {
                  "value": "projectDistrict3",
                  "label": "Centre ville",
                  "id": "projectDistrict3"
                }
              },
              {
                "node": {
                  "value": "projectDistrict4",
                  "label": "Îles de Nantes",
                  "id": "projectDistrict4"
                }
              },
              {
                "node": {
                  "value": "projectDistrict5",
                  "label": "Hauts pavés Saint-Félix",
                  "id": "projectDistrict5"
                }
              },
              {
                "node": {
                  "value": "projectDistrict6",
                  "label": "Malakoff Saint-Donation",
                  "id": "projectDistrict6"
                }
              },
              {
                "node": {
                  "value": "projectDistrict7",
                  "label": "Dervallières Zola",
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
