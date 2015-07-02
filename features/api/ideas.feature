Feature: Ideas

  Scenario: API client wants to know the number of ideas
    When I send a GET request to "/api/ideas"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """

  Scenario: API client wants to list comments of an idea
    When I send a GET request to "/api/ideas/3/comments"
    Then the JSON response should match:
    """
    {
      "total_count": @integer@,
      "comments":
      [
        {
          "can_contribute": @boolean@,
          "id": @integer@,
          "body": @string@,
          "created_at": "@string@.isDateTime()",
          "vote_count": @integer@,
          "author": {
            "username": @string@,
            "media": {
              "url": @string@
            },
            "_links": {
              "profile": @string@
            }
          },
          "author_email": @null@,
          "author_name": @null@,
          "is_trashed": @boolean@,
          "_links": {
            "vote": @string@,
            "edit": @string@,
            "report": @string@
          },
          "has_user_reported": @boolean@,
          "has_user_voted": @boolean@,
          "can_edit": @boolean@
        },
        @...@
      ],
      "can_report": @boolean@
    }
    """

  Scenario: API client wants to find the first comment of an idea
    When I send a GET request to "/api/ideas/3/comments?limit=1"
    Then the JSON response should match:
    """
    {
      "total_count": @integer@,
      "comments":
      [
        {
          "can_contribute": @boolean@,
          "id": @integer@,
          "body": @string@,
          "created_at": "@string@.isDateTime()",
          "vote_count": @integer@,
          "author": @...@,
          "author_email": @null@,
          "author_name": @null@,
          "is_trashed": @boolean@,
          "_links": @...@,
          "has_user_reported": @boolean@,
          "has_user_voted": @boolean@,
          "can_edit": @boolean@
        }
      ],
      "can_report": @boolean@
    }
    """

  Scenario: API client wants to find popular comments of an idea
    When I send a GET request to "/api/ideas/3/comments?filter=popular"
    Then the JSON response should match:
    """
    {
      "total_count": "@integer@.greaterThan(3)",
      "comments":
      [
        @...@
      ],
      "can_report": @boolean@
    }
    """
    And the comments should be ordered by popularity
