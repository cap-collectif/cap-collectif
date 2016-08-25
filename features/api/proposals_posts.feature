@proposal_posts
Feature: Proposal posts

## List Comments

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
          "media": @null@,
          "created_at": "@string@.isDateTime()",
          "updated_at": "@string@.isDateTime()",
          "themes": [
            {
              "title": @string@,
              "_links": {
                "show": @string@
              }
            },
            @...@
          ],
          "authors": @array@,
          "_links": {
            "show": @string@
          }
        },
        @...@
      ]
    }
    """
