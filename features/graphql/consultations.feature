@consultations
Feature: Consultations

  Scenario: GraphQL client wants to list consultations
    When I send a GraphQL request:
    """
    {
      consultations {
        id
      }
    }
    """
    Then the JSON response should match:
    """
    {
      "data": {
        "consultations": [
          {
            "id": @integer@
          },
          @...@
        ]
      }
    }
    """
