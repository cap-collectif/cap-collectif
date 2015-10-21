Feature: Opinion Types Api

  Scenario: API client wants to list comments of an event
    When I send a GET request to "/api/opinion_types/8"
    Then the JSON response should match:
    """
    {
      "availableLinkTypes": [
        {
          "id": @integer@,
          "label": @string@
        },
        @...@
      ],
      "id": 8,
      "title": @string@
    }
    """
