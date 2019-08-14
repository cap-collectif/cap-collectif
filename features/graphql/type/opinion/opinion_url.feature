@opinion_url
Feature: Url of an opinion

@read-only
Scenario: Anonymous wants to get opinion's url
  Given I send a GraphQL POST request:
    """
    {
      "query": "query ($opinionId: ID!) {
        opinion: node(id: $opinionId) {
          ... on Opinion {
            url
          }
        }
      }",
      "variables": {
        "opinionId": "opinion57"
      }
    }
    """
  Then the JSON response should match:
    """
    {
      "data": {
        "opinion": {
          "url": @string@
        }
      }
    }
    """
