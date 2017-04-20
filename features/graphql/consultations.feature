@consultations
Feature: Consultations

  Scenario: GraphQL client wants to list consultations
    When I send a GraphQL request:
    """
    {
      consultations {
         id
         title
         contribuable
         sections {
           title
         }
         contributions {
           id
         }
       }
    }
    """
    Then the JSON response should match:
    """
    {
      "data": {
        "consultations": [
          {
            "id": @integer@,
            "title": @string@,
            "contribuable": @boolean@,
            "sections": [
              {
                "title": @string@
              },
              @...@
            ],
            "contributions": [
              {
                "id": @integer@
              },
              @...@
            ]
          },
          @...@
        ]
      }
    }
    """
