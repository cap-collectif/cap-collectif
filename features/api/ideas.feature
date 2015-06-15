Feature: Ideas

  @dev
  Scenario: API client wants to list comments of an idea
    When I send a GET request to "/api/idea/2/comments"
    Then the JSON response should match:
    """
    [
      {
        "id": @integer@,
        "author": {
          "id": @integer@,
          "media": {
            "url": @string@
          }
        },
        "body": @string@,
        "created_at": "@string@.isDateTime()"
        "vote_count": @integer@,
      },
      @...@
    ]
    """
