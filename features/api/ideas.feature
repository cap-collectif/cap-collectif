Feature: Ideas

  Scenario: API client wants to list comments of an idea
    When I send a GET request to "/api/ideas/2/comments"
    Then the JSON response should match:
    """
    "total_count": @integer,
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
    ]
    """
