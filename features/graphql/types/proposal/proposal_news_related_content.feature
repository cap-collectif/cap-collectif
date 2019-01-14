@proposal_news_related_content
Feature: Related content for a blog post for a proposal

@database
Scenario: Admin wants to get the related content of the first proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($proposalId: ID!) {
      proposal: node(id: $proposalId) {
        id
        ... on Proposal {
          news {
            edges {
              node {
                id
                title
                relatedContent {
                  ... on Proposal {
                    id
                  }
                  ... on Theme {
                    id
                  }
                  ... on Project {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwx"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "proposal": {
        "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
        "news": {
          "edges": [
            {
              "node": {
                "id": @string@,
                "title": @string@,
                "relatedContent": [
                  {
                    "id": "theme1"
                  },
                  {
                    "id": "theme2"
                  },
                  {
                    "id": "UHJvcG9zYWw6cHJvcG9zYWwx"
                  },
                  @...@
                ]
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """

@database
Scenario: Admin wants to get only themes on the related content of the first proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($proposalId: ID!) {
      proposal: node(id: $proposalId) {
        id
        ... on Proposal {
          news {
            edges {
              node {
                id
                title
                relatedContent {
                  ... on Theme {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwx"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "proposal": {
        "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
        "news": {
          "edges": [
            {
              "node": {
                "id": @string@,
                "title": @string@,
                "relatedContent": [
                  {
                    "id": "theme1"
                  },
                  {
                    "id": "theme2"
                  },
                  @...@
                ]
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """

@database
Scenario: Admin wants to get only proposals on the related content of a blog post of the first proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($proposalId: ID!) {
      proposal: node(id: $proposalId) {
        id
        ... on Proposal {
          news {
            edges {
              node {
                id
                title
                relatedContent {
                  ... on Proposal {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwx"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "proposal": {
        "id": "UHJvcG9zYWw6cHJvcG9zYWwx",
        "news": {
          "edges": [
            {
              "node": {
                "id": @string@,
                "title": @string@,
                "relatedContent": [
                  {},
                  {},
                  {
                    "id": "UHJvcG9zYWw6cHJvcG9zYWwx"
                  },
                  @...@
                ]
              }
            },
            @...@
          ]
        }
      }
    }
  }
  """
