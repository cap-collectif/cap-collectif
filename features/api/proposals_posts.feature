@proposal_posts
Feature: Proposal posts

  Scenario: API client wants to list posts of a proposal
    When I send a GET request to "/api/proposals/1/posts"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "posts": [
      {
        "abstract": @string@,
        "id": @integer@,
        "title": @string@,
        "created_at": "@string@.isDateTime()",
        "updated_at": "@string@.isDateTime()",
        "media": @null@,
        "themes": [
          {
            "title": @string@,
            "_links": {
                "show": @string@
            }
          },
          @...@
        ],
        "authors": @...@,
        "_links": {
            "show": @string@
        }
      },
      @...@
      ]
    }
    """
