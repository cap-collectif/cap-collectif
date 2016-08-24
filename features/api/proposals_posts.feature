@proposal_posts
Feature: Proposal posts

## List Comments

  @parallel-scenario
  Scenario: API client wants to list comments of a proposal
    When I send a GET request to "/api/proposals/1/posts"
    Then the JSON response should match:
    """
    {
      "posts":
      [
        {
          "id": @integer@,
          "title": @string@,
          "abstract": @string@,
          "body": @string@,
          "created_at": "@string@.isDateTime()",
          "updated_at": "@string@.isDateTime()",
          "authors": [
            {
              "username": @string@,
              "displayName": @string@,
              "isAdmin": @boolean@,
              "uniqueId": @string@,
              "media": @...@,
              "_links": {
                "profile": @string@,
                "settings": @string@
              }
            },
            @...@
          ],
          "_links": {
            "show": @string@
          }
        },
        @...@
      ]
    }
    """
