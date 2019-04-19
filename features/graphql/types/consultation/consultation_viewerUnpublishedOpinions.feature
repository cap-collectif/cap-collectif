@consultation_viewerOpinionsUnpublished
Feature: Unpublished opinions of a consultation

@read-only
Scenario: Viewer wants to get his unpublished opinions
  Given I am logged in to graphql as user_not_confirmed_with_contributions
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($consultationId: ID!) {
      consultation: node(id: $consultationId) {
          ... on Consultation {
              viewerOpinionsUnpublished {
                  totalCount
                  edges {
                      node {
                          id
                          published
                          notPublishedReason
                      }
                  }
              }
          }
      }
    }",
    "variables": {
      "consultationId": "Q29uc3VsdGF0aW9uOnR5cGVEZWZhdWx0"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "consultation": {
            "viewerOpinionsUnpublished": {
              "totalCount": 10,
              "edges": [
                {
                  "node": {
                    "id": @string@,
                    "published": false,
                    "notPublishedReason": "WAITING_AUTHOR_CONFIRMATION"
                  }
                },
                @...@
              ]
            }
        }
    }
  }
  """
