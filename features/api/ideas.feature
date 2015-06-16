Feature: Ideas

  @dev
  Scenario: API client wants to list comments of an idea
    When I send a GET request to "/api/idea/2/comments"
    Then the JSON response should match:
    """
    [
      {
        "id": @integer@,
        "body": @string@,
        "created_at": "@string@.isDateTime()"
        "vote_count": @integer@,
        "author": {
          "username": @string@,
          "media": {
            "url": @string@
          }
        }
      },
      @...@
    ]
    """
